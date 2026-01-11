"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProposalOutput, ProposalContext } from "@/types/proposal";

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

// 会社規模表示名
const COMPANY_SIZE_LABELS: Record<string, string> = {
  "1-50": "1〜50名",
  "51-100": "51〜100名",
  "101-300": "101〜300名",
  "301-1000": "301〜1000名",
  "1001+": "1001名以上",
};

// 稟議書テンプレート生成
function generateMarkdown(context: ProposalContext): string {
  const { solution, diagnosis, searchResult, comparison } = context;
  const today = new Date().toLocaleDateString("ja-JP");
  
  let markdown = `# SaaS導入稟議書

## 1. 概要

| 項目 | 内容 |
|------|------|
| 対象製品 | ${solution.name} |
| ベンダー | ${solution.vendor} |
| カテゴリ | ${CATEGORY_LABELS[solution.category] || solution.category} |
| 起案日 | ${today} |

## 2. 導入目的

### 背景
${diagnosis.companyIndustry}業界の${COMPANY_SIZE_LABELS[diagnosis.companySize] || diagnosis.companySize}企業として、以下の課題を解決するため${CATEGORY_LABELS[solution.category] || solution.category}システムの導入を検討しています。

### 解決したい課題
${diagnosis.problems.length > 0 ? diagnosis.problems.map((p) => `- ${p}`).join("\n") : "- 業務効率化"}

## 3. 選定理由

### 推薦スコア
**${searchResult.score.toFixed(0)}点** / 100点

### 推薦理由
${searchResult.explain?.summary || "診断条件にマッチする製品です。"}

${searchResult.explain?.matchedFacts && searchResult.explain.matchedFacts.length > 0 ? `### 条件マッチ
${searchResult.explain.matchedFacts.map((f) => `- ✓ ${f.reason}`).join("\n")}` : ""}

## 4. 製品概要

${solution.description || `${solution.name}は${solution.vendor}が提供する${CATEGORY_LABELS[solution.category] || solution.category}ソリューションです。`}

`;

  // 比較結果があれば追加
  if (comparison && comparison.solutions.length > 1) {
    markdown += `## 5. 比較検討結果

| 製品名 | スコア |
|--------|--------|
${comparison.solutions.map((s) => `| ${s.name} | ${s.score.toFixed(0)}点 |`).join("\n")}

上記${comparison.solutions.length}製品を比較検討した結果、**${solution.name}**が最も要件にマッチすると判断しました。

`;
  }

  // 必須条件の充足
  markdown += `## ${comparison ? "6" : "5"}. 必須条件の充足

| 条件 | 状況 |
|------|------|
| SSO対応 | ${diagnosis.constraints.requireSso ? "必須 → 対応確認済み" : "任意"} |
| 監査ログ | ${diagnosis.constraints.requireAuditLog ? "必須 → 対応確認済み" : "任意"} |
${diagnosis.constraints.budgetMax ? `| 予算上限 | ¥${diagnosis.constraints.budgetMax.toLocaleString()}/月 |` : ""}

## ${comparison ? "7" : "6"}. 今後のスケジュール

1. **トライアル申込** - 本稟議承認後
2. **評価期間** - 2週間程度
3. **契約締結** - 評価完了後
4. **導入・運用開始** - 契約後1ヶ月以内

---

*本稟議書は DX Selecta により自動生成されました。*
`;

  return markdown;
}

// 稟議書生成
export async function generateProposal(
  runId: string,
  solutionId: string
): Promise<ProposalOutput> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }
  
  // 検索実行情報を取得
  const { data: searchRun, error: runError } = await supabase
    .from("search_runs")
    .select("*")
    .eq("id", runId)
    .single();
  
  if (runError || !searchRun) {
    throw new Error("検索実行情報が見つかりません");
  }
  
  // 製品情報を取得
  const { data: solution, error: solutionError } = await supabase
    .from("solutions")
    .select("*")
    .eq("id", solutionId)
    .single();
  
  if (solutionError || !solution) {
    throw new Error("製品情報が見つかりません");
  }
  
  // 検索結果を取得
  const { data: searchResult } = await supabase
    .from("search_results")
    .select("*")
    .eq("run_id", runId)
    .eq("solution_id", solutionId)
    .single();
  
  // 比較マトリクスを取得
  const { data: matrix } = await supabase
    .from("comparison_matrices")
    .select("*")
    .eq("run_id", runId)
    .single();
  
  // 比較対象の製品情報を取得
  let comparisonSolutions: { name: string; score: number }[] = [];
  if (matrix) {
    const { data: solutions } = await supabase
      .from("solutions")
      .select("id, name")
      .in("id", matrix.solutions);
    
    const { data: results } = await supabase
      .from("search_results")
      .select("solution_id, score")
      .eq("run_id", runId)
      .in("solution_id", matrix.solutions);
    
    if (solutions && results) {
      comparisonSolutions = solutions.map((s) => {
        const result = results.find((r) => r.solution_id === s.id);
        return {
          name: s.name,
          score: result ? Number(result.score) : 0,
        };
      }).sort((a, b) => b.score - a.score);
    }
  }
  
  // コンテキストを構築
  const inputSnapshot = searchRun.input_snapshot;
  const context: ProposalContext = {
    solution: {
      name: solution.name,
      vendor: solution.vendor,
      category: solution.category,
      description: solution.description,
    },
    diagnosis: {
      companyIndustry: inputSnapshot.company_industry,
      companySize: inputSnapshot.company_size,
      problems: inputSnapshot.problems || [],
      constraints: {
        requireSso: inputSnapshot.constraints?.requireSso || false,
        requireAuditLog: inputSnapshot.constraints?.requireAuditLog || false,
        budgetMax: inputSnapshot.constraints?.budgetMax || null,
      },
    },
    searchResult: {
      score: searchResult ? Number(searchResult.score) : 0,
      rank: searchResult ? searchResult.rank : 1,
      explain: searchResult?.explain || null,
    },
    comparison: comparisonSolutions.length > 1 ? { solutions: comparisonSolutions } : undefined,
  };
  
  // Markdown生成
  const markdownText = generateMarkdown(context);
  
  // 既存の稟議書があれば取得してバージョンアップ
  const { data: existing } = await supabase
    .from("proposal_outputs")
    .select("version")
    .eq("run_id", runId)
    .eq("primary_solution_id", solutionId)
    .order("version", { ascending: false })
    .limit(1)
    .single();
  
  const newVersion = existing ? existing.version + 1 : 1;
  
  // 稟議書を保存
  const { data: proposal, error: proposalError } = await supabase
    .from("proposal_outputs")
    .insert({
      run_id: runId,
      primary_solution_id: solutionId,
      format: "markdown",
      markdown_text: markdownText,
      version: newVersion,
    })
    .select()
    .single();
  
  if (proposalError || !proposal) {
    console.error("Proposal creation error:", proposalError);
    throw new Error("稟議書の作成に失敗しました");
  }
  
  return proposal;
}

// 稟議書取得
export async function getProposal(runId: string, solutionId: string): Promise<ProposalOutput | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("proposal_outputs")
    .select("*")
    .eq("run_id", runId)
    .eq("primary_solution_id", solutionId)
    .order("version", { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    return null;
  }
  
  return data;
}

// 稟議書更新（編集内容を保存）
export async function updateProposal(
  proposalId: string,
  markdownText: string
): Promise<ProposalOutput> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }
  
  // 既存の稟議書を取得
  const { data: existing, error: existingError } = await supabase
    .from("proposal_outputs")
    .select("*")
    .eq("id", proposalId)
    .single();
  
  if (existingError || !existing) {
    throw new Error("稟議書が見つかりません");
  }
  
  // 新しいバージョンを作成（編集履歴として保持）
  const newVersion = existing.version + 1;
  
  const { data: proposal, error: proposalError } = await supabase
    .from("proposal_outputs")
    .insert({
      run_id: existing.run_id,
      primary_solution_id: existing.primary_solution_id,
      format: "markdown",
      markdown_text: markdownText,
      version: newVersion,
    })
    .select()
    .single();
  
  if (proposalError || !proposal) {
    console.error("Proposal update error:", proposalError);
    throw new Error("稟議書の更新に失敗しました");
  }
  
  return proposal;
}

// 稟議書のバージョン履歴取得
export async function getProposalVersions(
  runId: string,
  solutionId: string
): Promise<Pick<ProposalOutput, "id" | "version" | "generated_at">[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("proposal_outputs")
    .select("id, version, generated_at")
    .eq("run_id", runId)
    .eq("primary_solution_id", solutionId)
    .order("version", { ascending: false });
  
  if (error) {
    console.error("Failed to fetch proposal versions:", error);
    return [];
  }
  
  return data || [];
}

// 稟議書取得（ID指定）
export async function getProposalById(proposalId: string): Promise<ProposalOutput | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("proposal_outputs")
    .select("*")
    .eq("id", proposalId)
    .single();
  
  if (error) {
    return null;
  }
  
  return data;
}

// 履歴アイテムの型
export type ProposalHistoryItem = {
  id: string;
  runId: string;
  solutionId: string;
  solutionName: string;
  solutionVendor: string;
  solutionCategory: string;
  generatedAt: string;
  version: number;
};

// 稟議書履歴一覧取得
export async function getProposalHistory(limit: number = 10): Promise<ProposalHistoryItem[]> {
  const supabase = await createClient();
  
  // 現在のユーザーのテナントに紐づくセッションの稟議のみ取得
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.user) {
    return [];
  }
  
  // ユーザーのテナントを取得
  const { data: membership, error: memberError } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.user.id)
    .limit(1)
    .single();
  
  if (memberError || !membership) {
    return [];
  }
  
  // 稟議履歴を取得（テナントに紐づくセッション経由）
  const { data, error } = await supabase
    .from("proposal_outputs")
    .select(`
      id,
      run_id,
      primary_solution_id,
      generated_at,
      version,
      search_runs!inner (
        session_id,
        diagnosis_sessions!inner (
          tenant_id
        )
      ),
      solutions!inner (
        name,
        vendor,
        category
      )
    `)
    .eq("search_runs.diagnosis_sessions.tenant_id", membership.tenant_id)
    .order("generated_at", { ascending: false })
    .limit(limit);
  
  if (error || !data) {
    console.error("Failed to fetch proposal history:", error);
    return [];
  }
  
  return data.map((item) => ({
    id: item.id,
    runId: item.run_id,
    solutionId: item.primary_solution_id,
    solutionName: (item.solutions as unknown as { name: string }).name,
    solutionVendor: (item.solutions as unknown as { vendor: string }).vendor,
    solutionCategory: (item.solutions as unknown as { category: string }).category,
    generatedAt: item.generated_at,
    version: item.version,
  }));
}
