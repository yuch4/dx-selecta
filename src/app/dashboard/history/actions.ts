"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  HistoryItem,
  HistoryFilters,
  SessionDetail,
  HistoryListResponse,
} from "@/types/history";
import type { Category, SessionStatus } from "@/types/diagnosis";

// カテゴリ表示名
const CATEGORY_LABELS: Record<string, string> = {
  accounting: "会計",
  expense: "経費精算",
  attendance: "勤怠管理",
  hr: "人事労務",
  workflow: "ワークフロー",
  e_contract: "電子契約",
  invoice: "請求書",
  procurement: "調達",
};

// 履歴一覧取得
export async function getHistoryList(
  filters: HistoryFilters = {},
  limit: number = 20,
  offset: number = 0
): Promise<HistoryListResponse> {
  const supabase = await createClient();

  // 現在のユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { items: [], total: 0, hasMore: false };
  }

  // ユーザーのテナントを取得
  const { data: membership } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return { items: [], total: 0, hasMore: false };
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
    .eq("tenant_id", membership.tenant_id);

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
    const now = new Date();
    let startDate: Date;

    switch (filters.period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    query = query.gte("created_at", startDate.toISOString());
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

// セッション詳細取得
export async function getSessionDetail(
  sessionId: string
): Promise<SessionDetail | null> {
  const supabase = await createClient();

  // 現在のユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // セッション情報を取得
  const { data: session, error: sessionError } = await supabase
    .from("diagnosis_sessions")
    .select(
      `
      id,
      status,
      created_at,
      updated_at,
      completed_at
    `
    )
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    console.error("Failed to fetch session:", sessionError);
    return null;
  }

  // 診断入力を取得
  const { data: inputData } = await supabase
    .from("diagnosis_inputs")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  // 検索実行結果を取得
  const { data: searchRunsData } = await supabase
    .from("search_runs")
    .select(
      `
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
          name,
          vendor
        )
      )
    `
    )
    .eq("session_id", sessionId)
    .order("executed_at", { ascending: false });

  // 比較マトリクスを取得
  const runIds = (searchRunsData || []).map((r) => r.id);
  let comparisonsData: Array<{
    id: string;
    created_at: string;
    solutions: string[];
  }> = [];

  if (runIds.length > 0) {
    const { data } = await supabase
      .from("comparison_matrices")
      .select("id, created_at, solutions")
      .in("run_id", runIds);
    comparisonsData = data || [];
  }

  // 比較対象のソリューション名を取得
  const solutionIds = comparisonsData.flatMap((c) => c.solutions);
  let solutionNamesMap: Record<string, string> = {};

  if (solutionIds.length > 0) {
    const { data: solutions } = await supabase
      .from("solutions")
      .select("id, name")
      .in("id", solutionIds);

    solutionNamesMap = (solutions || []).reduce(
      (acc, s) => {
        acc[s.id] = s.name;
        return acc;
      },
      {} as Record<string, string>
    );
  }

  // 稟議出力を取得
  let proposalsData: Array<{
    id: string;
    generated_at: string;
    format: string;
    version: number;
    primary_solution_id: string;
    markdown_text: string | null;
  }> = [];

  if (runIds.length > 0) {
    const { data } = await supabase
      .from("proposal_outputs")
      .select(
        `
        id,
        generated_at,
        format,
        version,
        primary_solution_id,
        markdown_text
      `
      )
      .in("run_id", runIds)
      .order("generated_at", { ascending: false });
    proposalsData = data || [];
  }

  // 稟議の推奨製品名を取得
  const proposalSolutionIds = proposalsData.map((p) => p.primary_solution_id);
  let proposalSolutionNames: Record<string, string> = {};

  if (proposalSolutionIds.length > 0) {
    const { data: solutions } = await supabase
      .from("solutions")
      .select("id, name")
      .in("id", proposalSolutionIds);

    proposalSolutionNames = (solutions || []).reduce(
      (acc, s) => {
        acc[s.id] = s.name;
        return acc;
      },
      {} as Record<string, string>
    );
  }

  // レスポンスを構築
  const input = inputData
    ? {
        id: inputData.id,
        companyIndustry: inputData.company_industry,
        companySize: inputData.company_size,
        companyRegion: inputData.company_region,
        category: inputData.category as Category,
        problems: inputData.problems || [],
        problemFreeText: inputData.problem_free_text,
        constraints: inputData.constraints || {},
        weights: inputData.weights || {},
      }
    : null;

  const searchRuns = (searchRunsData || []).map((run) => {
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
        const sol = r.solutions as unknown as { name: string; vendor: string };
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

  const comparisons = comparisonsData.map((c) => ({
    id: c.id,
    createdAt: c.created_at,
    solutions: c.solutions,
    solutionNames: c.solutions.map((id) => solutionNamesMap[id] || "Unknown"),
  }));

  const proposals = proposalsData.map((p) => ({
    id: p.id,
    generatedAt: p.generated_at,
    format: p.format as "markdown" | "google_docs",
    version: p.version,
    primarySolutionName: proposalSolutionNames[p.primary_solution_id] || "Unknown",
    markdownText: p.markdown_text,
  }));

  return {
    session: {
      id: session.id,
      status: session.status as SessionStatus,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      completedAt: session.completed_at,
    },
    input,
    searchRuns,
    comparisons,
    proposals,
  };
}

// セッションをアーカイブ
export async function archiveSession(sessionId: string): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("認証が必要です");
  }

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
