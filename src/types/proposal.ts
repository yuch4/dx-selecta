// 稟議書関連の型定義

// フォーマット
export type ProposalFormat = 'markdown' | 'google_docs';

// 稟議出力
export interface ProposalOutput {
  id: string;
  run_id: string;
  primary_solution_id: string;
  format: ProposalFormat;
  markdown_text: string | null;
  google_doc_url: string | null;
  generated_at: string;
  version: number;
}

// 稟議生成コンテキスト
export interface ProposalContext {
  // 製品情報
  solution: {
    name: string;
    vendor: string;
    category: string;
    description: string | null;
  };
  // 診断情報
  diagnosis: {
    companyIndustry: string;
    companySize: string;
    problems: string[];
    constraints: {
      requireSso: boolean;
      requireAuditLog: boolean;
      budgetMax: number | null;
    };
  };
  // 検索結果
  searchResult: {
    score: number;
    rank: number;
    explain: {
      summary: string;
      matchedFacts: { factType: string; reason: string }[];
    } | null;
  };
  // 比較結果（オプション）
  comparison?: {
    solutions: { name: string; score: number }[];
  };
}

// 稟議出力（コンテキスト付き）
export interface ProposalOutputWithContext extends ProposalOutput {
  context: ProposalContext;
}
