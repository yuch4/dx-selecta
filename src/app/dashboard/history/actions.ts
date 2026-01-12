"use server";

import { requireTenantUser, requireUser, AuthError } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getPeriodStartDate } from "@/lib/history/utils";
import { CATEGORY_LABELS } from "@/types/diagnosis";
import type {
  HistoryItem,
  HistoryFilters,
  SessionDetail,
  HistoryListResponse,
} from "@/types/history";
import type { Category, SessionStatus } from "@/types/diagnosis";

// 履歴一覧取得
export async function getHistoryList(
  filters: HistoryFilters = {},
  limit: number = 20,
  offset: number = 0
): Promise<HistoryListResponse> {
  let tenantId: string;
  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    const ctx = await requireTenantUser();
    tenantId = ctx.tenantId;
    supabase = ctx.supabase;
  } catch (error) {
    if (error instanceof AuthError) {
      return { items: [], total: 0, hasMore: false };
    }
    throw error;
  }

  // クエリを構築
  let query = supabase
    .from("diagnosis_sessions")
    .select(
      `
      id,
      status,
      created_at,
      updated_at,
      completed_at,
      diagnosis_inputs (
        id,
        category,
        company_industry
      ),
      search_runs (
        id,
        executed_at,
        comparison_matrices (
          id
        ),
        proposal_outputs (
          id,
          primary_solution_id,
          generated_at,
          solutions:primary_solution_id (
            name
          )
        )
      )
    `,
      { count: "exact" }
    )
    .eq("tenant_id", tenantId);

  // ステータスフィルター
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  // カテゴリフィルター
  if (filters.category && filters.category !== "all") {
    query = query.eq("diagnosis_inputs.category", filters.category);
  }

  // 期間フィルター
  if (filters.period && filters.period !== "all") {
    const startDate = getPeriodStartDate(filters.period);
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
  }

  // ソートとページネーション
  query = query
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch history:", error);
    return { items: [], total: 0, hasMore: false };
  }

  // レスポンスを整形
  const items: HistoryItem[] = (data || []).map((session) => {
    const input = Array.isArray(session.diagnosis_inputs)
      ? session.diagnosis_inputs[0]
      : session.diagnosis_inputs;

    const searchRuns = Array.isArray(session.search_runs)
      ? session.search_runs
      : session.search_runs
        ? [session.search_runs]
        : [];

    const hasSearchRun = searchRuns.length > 0;
    const hasComparison = searchRuns.some(
      (run) =>
        run.comparison_matrices &&
        (Array.isArray(run.comparison_matrices)
          ? run.comparison_matrices.length > 0
          : true)
    );
    const hasProposal = searchRuns.some(
      (run) =>
        run.proposal_outputs &&
        (Array.isArray(run.proposal_outputs)
          ? run.proposal_outputs.length > 0
          : true)
    );

    // 最新の稟議書情報を取得
    let proposalId: string | undefined;
    let primarySolutionName: string | undefined;

    for (const run of searchRuns) {
      const proposals = Array.isArray(run.proposal_outputs)
        ? run.proposal_outputs
        : run.proposal_outputs
          ? [run.proposal_outputs]
          : [];

      if (proposals.length > 0) {
        const latestProposal = proposals[0];
        proposalId = latestProposal.id;
        if (latestProposal.solutions) {
          const sol = latestProposal.solutions as unknown as { name: string };
          primarySolutionName = sol.name;
        }
      }
    }

    const category = (input?.category || "expense") as Category;
    const categoryLabel = CATEGORY_LABELS[category] || category;

    // 進捗ステップの計算（in_progressの場合）
    let currentStep = 1;
    const totalSteps = 4; // 診断 -> 検索 -> 比較 -> 稟議

    if (input) currentStep = 1;
    if (hasSearchRun) currentStep = 2;
    if (hasComparison) currentStep = 3;
    if (hasProposal) currentStep = 4;

    // タイトルと説明を生成
    const title = primarySolutionName
      ? `${categoryLabel} - ${primarySolutionName}`
      : `${categoryLabel}選定`;

    const description = generateDescription(
      session.status as SessionStatus,
      hasSearchRun,
      hasComparison,
      hasProposal
    );

    return {
      id: session.id,
      sessionId: session.id,
      type: hasProposal ? "proposal" : hasComparison ? "comparison" : "diagnosis",
      status: session.status as SessionStatus,
      category,
      categoryLabel,
      title,
      description,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      completedAt: session.completed_at,
      hasSearchRun,
      hasComparison,
      hasProposal,
      currentStep: session.status === "in_progress" ? currentStep : undefined,
      totalSteps: session.status === "in_progress" ? totalSteps : undefined,
      proposalId,
      primarySolutionName,
    };
  });

  return {
    items,
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  };
}

function generateDescription(
  status: SessionStatus,
  hasSearchRun: boolean,
  hasComparison: boolean,
  hasProposal: boolean
): string {
  if (status === "in_progress") {
    if (!hasSearchRun) return "診断入力中";
    if (!hasComparison) return "検索完了 - 比較待ち";
    if (!hasProposal) return "比較完了 - 稟議書生成待ち";
    return "作業中";
  }

  if (status === "archived") {
    return "アーカイブ済み";
  }

  // completed
  if (hasProposal) return "稟議書生成済み";
  if (hasComparison) return "比較完了";
  if (hasSearchRun) return "検索完了";
  return "診断完了";
}

// セッション詳細取得（N+1最適化版）
export async function getSessionDetail(
  sessionId: string
): Promise<SessionDetail | null> {
  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    const ctx = await requireUser();
    supabase = ctx.supabase;
  } catch (error) {
    if (error instanceof AuthError) {
      return null;
    }
    throw error;
  }

  // 1クエリで全データを取得（N+1解消）
  const { data: sessionData, error: sessionError } = await supabase
    .from("diagnosis_sessions")
    .select(
      `
      id,
      status,
      created_at,
      updated_at,
      completed_at,
      diagnosis_inputs (
        id,
        company_industry,
        company_size,
        company_region,
        category,
        problems,
        problem_free_text,
        constraints,
        weights
      ),
      search_runs (
        id,
        executed_at,
        total_candidates,
        duration_ms,
        search_results (
          id,
          rank,
          score,
          concerns,
          solution_id,
          solutions (
            id,
            name,
            vendor
          )
        ),
        comparison_matrices (
          id,
          created_at,
          solutions
        ),
        proposal_outputs (
          id,
          generated_at,
          format,
          version,
          primary_solution_id,
          markdown_text
        )
      )
    `
    )
    .eq("id", sessionId)
    .single();

  if (sessionError || !sessionData) {
    console.error("Failed to fetch session:", sessionError);
    return null;
  }

  // 診断入力を整形
  const inputRaw = Array.isArray(sessionData.diagnosis_inputs)
    ? sessionData.diagnosis_inputs[0]
    : sessionData.diagnosis_inputs;

  const input = inputRaw
    ? {
        id: inputRaw.id,
        companyIndustry: inputRaw.company_industry,
        companySize: inputRaw.company_size,
        companyRegion: inputRaw.company_region,
        category: inputRaw.category as Category,
        problems: inputRaw.problems || [],
        problemFreeText: inputRaw.problem_free_text,
        constraints: inputRaw.constraints || {},
        weights: inputRaw.weights || {},
      }
    : null;

  // 検索実行結果を整形
  const searchRunsRaw = Array.isArray(sessionData.search_runs)
    ? sessionData.search_runs
    : sessionData.search_runs
      ? [sessionData.search_runs]
      : [];

  // ソリューションID -> 名前のマップを構築（比較・稟議用）
  const solutionNamesMap: Record<string, string> = {};

  const searchRuns = searchRunsRaw.map((run) => {
    const results = Array.isArray(run.search_results)
      ? run.search_results
      : run.search_results
        ? [run.search_results]
        : [];

    return {
      id: run.id,
      executedAt: run.executed_at,
      totalCandidates: run.total_candidates || 0,
      durationMs: run.duration_ms,
      results: results.map((r) => {
        const sol = r.solutions as unknown as {
          id: string;
          name: string;
          vendor: string;
        };
        // マップに追加
        if (sol?.id) {
          solutionNamesMap[sol.id] = sol.name;
        }
        return {
          id: r.id,
          rank: r.rank,
          score: Number(r.score),
          solutionName: sol?.name || "Unknown",
          solutionVendor: sol?.vendor || "Unknown",
          concerns: r.concerns || [],
        };
      }),
    };
  });

  // 比較マトリクスを整形
  const comparisonsRaw = searchRunsRaw.flatMap((run) => {
    const matrices = Array.isArray(run.comparison_matrices)
      ? run.comparison_matrices
      : run.comparison_matrices
        ? [run.comparison_matrices]
        : [];
    return matrices;
  });

  const comparisons = comparisonsRaw.map((c) => ({
    id: c.id,
    createdAt: c.created_at,
    solutions: c.solutions as string[],
    solutionNames: (c.solutions as string[]).map(
      (id) => solutionNamesMap[id] || "Unknown"
    ),
  }));

  // 稟議出力を整形
  const proposalsRaw = searchRunsRaw.flatMap((run) => {
    const outputs = Array.isArray(run.proposal_outputs)
      ? run.proposal_outputs
      : run.proposal_outputs
        ? [run.proposal_outputs]
        : [];
    return outputs;
  });

  // 稟議をgeneratedAtで降順ソート
  proposalsRaw.sort(
    (a, b) =>
      new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
  );

  const proposals = proposalsRaw.map((p) => ({
    id: p.id,
    generatedAt: p.generated_at,
    format: p.format as "markdown" | "google_docs",
    version: p.version,
    primarySolutionName:
      solutionNamesMap[p.primary_solution_id] || "Unknown",
    markdownText: p.markdown_text,
  }));

  return {
    session: {
      id: sessionData.id,
      status: sessionData.status as SessionStatus,
      createdAt: sessionData.created_at,
      updatedAt: sessionData.updated_at,
      completedAt: sessionData.completed_at,
    },
    input,
    searchRuns,
    comparisons,
    proposals,
  };
}

// セッションをアーカイブ
export async function archiveSession(sessionId: string): Promise<boolean> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("diagnosis_sessions")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    console.error("Failed to archive session:", error);
    throw new Error("アーカイブに失敗しました");
  }

  return true;
}

// 作業中セッション一覧取得（ダッシュボード表示用）
export async function getInProgressSessions(
  limit: number = 5
): Promise<HistoryItem[]> {
  const result = await getHistoryList({ status: "in_progress" }, limit, 0);
  return result.items;
}
