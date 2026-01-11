"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  ComparisonMatrix,
  ComparisonMatrixWithSolutions,
  ComparisonAxis,
  ComparisonCell,
  ComparisonSolution,
} from "@/types/compare";

// 比較マトリクス生成
export async function generateMatrix(
  runId: string,
  solutionIds: string[]
): Promise<ComparisonMatrix> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }
  
  if (solutionIds.length < 2) {
    throw new Error("比較には2件以上の製品が必要です");
  }
  
  // 製品情報を取得
  const { data: solutions, error: solutionsError } = await supabase
    .from("solutions")
    .select("*")
    .in("id", solutionIds);
  
  if (solutionsError || !solutions) {
    throw new Error("製品情報の取得に失敗しました");
  }
  
  // ファクト情報を取得
  const { data: facts } = await supabase
    .from("solution_facts")
    .select("*")
    .in("solution_id", solutionIds);
  
  // 検索結果を取得（スコア用）
  const { data: searchResults } = await supabase
    .from("search_results")
    .select("*")
    .eq("run_id", runId)
    .in("solution_id", solutionIds);
  
  // 比較軸を構築
  const axes: ComparisonAxis[] = [
    { id: "vendor", name: "ベンダー", order: 1 },
    { id: "category", name: "カテゴリ", order: 2 },
    { id: "sso", name: "SSO対応", order: 3 },
    { id: "audit_log", name: "監査ログ", order: 4 },
    { id: "api", name: "API", order: 5 },
    { id: "mobile", name: "モバイル", order: 6 },
    { id: "score", name: "スコア", order: 7 },
  ];
  
  // セルデータを構築
  const cells: ComparisonCell[] = [];
  
  for (const solution of solutions) {
    const solutionFacts = facts?.filter((f) => f.solution_id === solution.id) || [];
    const searchResult = searchResults?.find((r) => r.solution_id === solution.id);
    
    // ベンダー
    cells.push({
      solutionId: solution.id,
      axisId: "vendor",
      value: solution.vendor,
      status: "confirmed",
      evidenceUrl: null,
    });
    
    // カテゴリ
    const categoryLabels: Record<string, string> = {
      accounting: "会計",
      expense: "経費精算",
      attendance: "勤怠管理",
      hr: "人事労務",
      workflow: "ワークフロー",
      e_contract: "電子契約",
      invoice: "請求書",
      procurement: "調達",
    };
    cells.push({
      solutionId: solution.id,
      axisId: "category",
      value: categoryLabels[solution.category] || solution.category,
      status: "confirmed",
      evidenceUrl: null,
    });
    
    // SSO
    const ssoFact = solutionFacts.find((f) => f.fact_type === "sso");
    cells.push({
      solutionId: solution.id,
      axisId: "sso",
      value: ssoFact?.fact_value === "supported" ? "✓" : "-",
      status: ssoFact ? "confirmed" : "needs_verification",
      evidenceUrl: ssoFact?.evidence_url || null,
    });
    
    // 監査ログ
    const auditFact = solutionFacts.find((f) => f.fact_type === "audit_log");
    cells.push({
      solutionId: solution.id,
      axisId: "audit_log",
      value: auditFact?.fact_value === "supported" ? "✓" : "-",
      status: auditFact ? "confirmed" : "needs_verification",
      evidenceUrl: auditFact?.evidence_url || null,
    });
    
    // API
    const apiFact = solutionFacts.find((f) => f.fact_type === "api");
    cells.push({
      solutionId: solution.id,
      axisId: "api",
      value: apiFact?.fact_value === "supported" ? "✓" : "-",
      status: apiFact ? "confirmed" : "needs_verification",
      evidenceUrl: apiFact?.evidence_url || null,
    });
    
    // モバイル
    const mobileFact = solutionFacts.find((f) => f.fact_type === "mobile");
    cells.push({
      solutionId: solution.id,
      axisId: "mobile",
      value: mobileFact?.fact_value === "supported" ? "✓" : "-",
      status: mobileFact ? "confirmed" : "needs_verification",
      evidenceUrl: mobileFact?.evidence_url || null,
    });
    
    // スコア
    cells.push({
      solutionId: solution.id,
      axisId: "score",
      value: searchResult ? `${Number(searchResult.score).toFixed(0)}` : "-",
      status: "confirmed",
      evidenceUrl: null,
    });
  }
  
  // 既存のマトリクスがあれば削除
  await supabase
    .from("comparison_matrices")
    .delete()
    .eq("run_id", runId);
  
  // マトリクスを保存
  const { data: matrix, error: matrixError } = await supabase
    .from("comparison_matrices")
    .insert({
      run_id: runId,
      solutions: solutionIds,
      axes,
      cells,
    })
    .select()
    .single();
  
  if (matrixError || !matrix) {
    console.error("Matrix creation error:", matrixError);
    throw new Error("比較マトリクスの作成に失敗しました");
  }
  
  return matrix;
}

// 比較マトリクス取得
export async function getMatrix(runId: string): Promise<ComparisonMatrixWithSolutions | null> {
  const supabase = await createClient();
  
  // マトリクスを取得
  const { data: matrix, error } = await supabase
    .from("comparison_matrices")
    .select("*")
    .eq("run_id", runId)
    .single();
  
  if (error || !matrix) {
    return null;
  }
  
  // 製品情報を取得
  const { data: solutions } = await supabase
    .from("solutions")
    .select("*")
    .in("id", matrix.solutions);
  
  // 検索結果を取得
  const { data: searchResults } = await supabase
    .from("search_results")
    .select("*")
    .eq("run_id", runId)
    .in("solution_id", matrix.solutions);
  
  // ソリューション詳細を構築
  const solutionDetails: ComparisonSolution[] = (solutions || []).map((s) => {
    const result = searchResults?.find((r) => r.solution_id === s.id);
    return {
      id: s.id,
      name: s.name,
      vendor: s.vendor,
      category: s.category,
      description: s.description,
      website_url: s.website_url,
      score: result ? Number(result.score) : 0,
      rank: result ? result.rank : 999,
    };
  });
  
  // スコア順にソート
  solutionDetails.sort((a, b) => a.rank - b.rank);
  
  return {
    ...matrix,
    solutionDetails,
  };
}

// CSVエクスポート
export async function exportCsv(runId: string): Promise<string> {
  const matrix = await getMatrix(runId);
  
  if (!matrix) {
    throw new Error("比較マトリクスが見つかりません");
  }
  
  const { axes, cells, solutionDetails } = matrix;
  
  // ヘッダー行
  const header = ["項目", ...solutionDetails.map((s) => s.name)];
  
  // データ行
  const rows = axes.map((axis) => {
    const row = [axis.name];
    for (const solution of solutionDetails) {
      const cell = cells.find(
        (c) => c.solutionId === solution.id && c.axisId === axis.id
      );
      row.push(cell?.value || "-");
    }
    return row;
  });
  
  // CSV文字列を生成
  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  
  return csvContent;
}
