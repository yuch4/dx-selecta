"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  SearchRun,
  SearchResultWithSolution,
  ScoreBreakdown,
  SearchExplain,
  InputSnapshot,
} from "@/types/search";

// 診断入力を取得
async function getDiagnosisInput(sessionId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("diagnosis_inputs")
    .select("*")
    .eq("session_id", sessionId)
    .single();
  
  if (error || !data) {
    throw new Error("診断入力が見つかりません");
  }
  
  return data;
}

// スコア計算
function calculateScore(
  solution: { category: string },
  facts: { fact_type: string; fact_value: string }[],
  input: { category: string; constraints: { requireSso: boolean; requireAuditLog: boolean } }
): { score: number; breakdown: ScoreBreakdown } {
  const baseScore = 50;
  let categoryMatch = 0;
  let ssoMatch = 0;
  let auditLogMatch = 0;
  
  // カテゴリマッチ: +30
  if (solution.category === input.category) {
    categoryMatch = 30;
  }
  
  // SSO対応: +10
  const ssoFact = facts.find((f) => f.fact_type === "sso");
  if (ssoFact?.fact_value === "supported") {
    ssoMatch = input.constraints.requireSso ? 10 : 5;
  }
  
  // 監査ログ対応: +10
  const auditFact = facts.find((f) => f.fact_type === "audit_log");
  if (auditFact?.fact_value === "supported") {
    auditLogMatch = input.constraints.requireAuditLog ? 10 : 5;
  }
  
  const total = Math.min(baseScore + categoryMatch + ssoMatch + auditLogMatch, 100);
  
  return {
    score: total,
    breakdown: {
      baseScore,
      categoryMatch,
      ssoMatch,
      auditLogMatch,
      total,
    },
  };
}

// Explain生成
function generateExplain(
  solution: { name: string; category: string },
  facts: { fact_type: string; fact_value: string }[],
  input: { category: string; constraints: { requireSso: boolean; requireAuditLog: boolean } }
): SearchExplain {
  const matchedFacts: SearchExplain["matchedFacts"] = [];
  const categoryMatch = solution.category === input.category;
  
  // SSOマッチ
  const ssoFact = facts.find((f) => f.fact_type === "sso");
  if (ssoFact?.fact_value === "supported" && input.constraints.requireSso) {
    matchedFacts.push({
      factType: "sso",
      factValue: "supported",
      reason: "SSO対応が必須条件にマッチしています",
    });
  }
  
  // 監査ログマッチ
  const auditFact = facts.find((f) => f.fact_type === "audit_log");
  if (auditFact?.fact_value === "supported" && input.constraints.requireAuditLog) {
    matchedFacts.push({
      factType: "audit_log",
      factValue: "supported",
      reason: "監査ログ対応が必須条件にマッチしています",
    });
  }
  
  // サマリ生成
  let summary = "";
  if (categoryMatch) {
    summary = `ご指定の業務カテゴリにマッチする製品です。`;
  } else {
    summary = `カテゴリは異なりますが、条件にマッチする機能を持っています。`;
  }
  
  if (matchedFacts.length > 0) {
    summary += ` ${matchedFacts.length}件の必須条件を満たしています。`;
  }
  
  return {
    matchedFacts,
    categoryMatch,
    summary,
  };
}

// 検索実行
export async function runSearch(sessionId: string): Promise<SearchRun> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }
  
  const startTime = Date.now();
  
  // 診断入力を取得
  const input = await getDiagnosisInput(sessionId);
  
  // 製品を取得（カテゴリでフィルタ、または全件）
  const { data: solutions, error: solutionsError } = await supabase
    .from("solutions")
    .select("*")
    .eq("is_active", true);
  
  if (solutionsError || !solutions) {
    throw new Error("製品データの取得に失敗しました");
  }
  
  // 製品のファクトを取得
  const solutionIds = solutions.map((s) => s.id);
  const { data: allFacts } = await supabase
    .from("solution_facts")
    .select("*")
    .in("solution_id", solutionIds);
  
  const facts = allFacts || [];
  
  // Must条件でフィルタ
  let filteredSolutions = solutions;
  
  if (input.constraints?.requireSso) {
    const ssoSupportedIds = facts
      .filter((f) => f.fact_type === "sso" && f.fact_value === "supported")
      .map((f) => f.solution_id);
    filteredSolutions = filteredSolutions.filter((s) => ssoSupportedIds.includes(s.id));
  }
  
  if (input.constraints?.requireAuditLog) {
    const auditSupportedIds = facts
      .filter((f) => f.fact_type === "audit_log" && f.fact_value === "supported")
      .map((f) => f.solution_id);
    filteredSolutions = filteredSolutions.filter((s) => auditSupportedIds.includes(s.id));
  }
  
  // スコア計算
  const scoredSolutions = filteredSolutions.map((solution) => {
    const solutionFacts = facts.filter((f) => f.solution_id === solution.id);
    const { score, breakdown } = calculateScore(solution, solutionFacts, input);
    const explain = generateExplain(solution, solutionFacts, input);
    
    return {
      solution,
      facts: solutionFacts,
      score,
      breakdown,
      explain,
    };
  });
  
  // スコアでソート（降順）
  scoredSolutions.sort((a, b) => b.score - a.score);
  
  // Top 5を取得
  const topResults = scoredSolutions.slice(0, 5);
  
  const durationMs = Date.now() - startTime;
  
  // 入力スナップショット作成
  const inputSnapshot: InputSnapshot = {
    category: input.category,
    company_industry: input.company_industry,
    company_size: input.company_size,
    company_region: input.company_region,
    problems: input.problems || [],
    constraints: input.constraints || {
      budgetMax: null,
      deployDeadline: null,
      requiredLanguages: [],
      requireSso: false,
      requireAuditLog: false,
      dataResidency: null,
    },
    weights: input.weights || {
      operationEase: 5,
      deploymentEase: 5,
      integrations: 5,
      security: 5,
      price: 5,
    },
  };
  
  // SearchRun作成
  const { data: searchRun, error: runError } = await supabase
    .from("search_runs")
    .insert({
      session_id: sessionId,
      input_snapshot: inputSnapshot,
      total_candidates: filteredSolutions.length,
      duration_ms: durationMs,
    })
    .select()
    .single();
  
  if (runError || !searchRun) {
    console.error("SearchRun creation error:", runError);
    throw new Error("検索結果の保存に失敗しました");
  }
  
  // SearchResults作成
  for (let i = 0; i < topResults.length; i++) {
    const result = topResults[i];
    await supabase.from("search_results").insert({
      run_id: searchRun.id,
      solution_id: result.solution.id,
      rank: i + 1,
      score: result.score,
      score_breakdown: result.breakdown,
      explain: result.explain,
      concerns: [],
    });
  }
  
  return searchRun;
}

// 検索結果を取得
export async function getSearchRun(runId: string): Promise<SearchRun | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("search_runs")
    .select("*")
    .eq("id", runId)
    .single();
  
  if (error) {
    console.error("SearchRun fetch error:", error);
    return null;
  }
  
  return data;
}

// 検索結果詳細を取得（製品情報付き）
export async function getSearchResults(runId: string): Promise<SearchResultWithSolution[]> {
  const supabase = await createClient();
  
  // 検索結果を取得
  const { data: results, error } = await supabase
    .from("search_results")
    .select("*")
    .eq("run_id", runId)
    .order("rank", { ascending: true });
  
  if (error || !results) {
    console.error("SearchResults fetch error:", error);
    return [];
  }
  
  // 製品IDを抽出
  const solutionIds = results.map((r) => r.solution_id);
  
  // 製品情報を取得
  const { data: solutions } = await supabase
    .from("solutions")
    .select("*")
    .in("id", solutionIds);
  
  // ファクト情報を取得
  const { data: facts } = await supabase
    .from("solution_facts")
    .select("*")
    .in("solution_id", solutionIds);
  
  // 結果に製品情報を結合
  return results.map((result) => ({
    ...result,
    solution: solutions?.find((s) => s.id === result.solution_id) || null,
    facts: facts?.filter((f) => f.solution_id === result.solution_id) || [],
  })) as SearchResultWithSolution[];
}

// セッションの最新検索結果を取得
export async function getLatestSearchRun(sessionId: string): Promise<SearchRun | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("search_runs")
    .select("*")
    .eq("session_id", sessionId)
    .order("executed_at", { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    return null;
  }
  
  return data;
}
