// 検索・推薦関連の型定義

// Solution（SaaS製品）
export interface Solution {
  id: string;
  name: string;
  vendor: string;
  category: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  origin_country: string;
  sales_regions: string[];
  locales: string[];
  is_active: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// SolutionFact（製品ファクト）
export type FactType = 'sso' | 'audit_log' | 'data_residency' | 'api' | 'mobile' | 'offline' | 'support' | 'compliance';
export type Confidence = 'high' | 'medium' | 'low';

export interface SolutionFact {
  id: string;
  solution_id: string;
  fact_type: FactType;
  fact_value: string;
  evidence_url: string | null;
  verified_at: string;
  confidence: Confidence;
  created_at: string;
  updated_at: string;
}

// SearchRun（検索実行）
export interface SearchRun {
  id: string;
  session_id: string;
  input_snapshot: InputSnapshot;
  total_candidates: number;
  executed_at: string;
  duration_ms: number | null;
}

// InputSnapshot（検索時の入力スナップショット）
export interface InputSnapshot {
  category: string;
  company_industry: string;
  company_size: string;
  company_region: string;
  problems: string[];
  constraints: {
    budgetMax: number | null;
    deployDeadline: string | null;
    requiredLanguages: string[];
    requireSso: boolean;
    requireAuditLog: boolean;
    dataResidency: string | null;
  };
  weights: {
    operationEase: number;
    deploymentEase: number;
    integrations: number;
    security: number;
    price: number;
  };
}

// ScoreBreakdown（スコア内訳）
export interface ScoreBreakdown {
  categoryMatch: number;
  ssoMatch: number;
  auditLogMatch: number;
  baseScore: number;
  total: number;
  // ハイブリッド検索スコア
  bm25Score?: number;
  vectorScore?: number;
  relevanceScore?: number;
}

// MatchedChunk（マッチしたドキュメントチャンク）
export interface MatchedChunk {
  chunkId: string;
  content: string;
  docType: string;
  sourceUrl: string | null;
  bm25Score: number;
  vectorScore: number;
  combinedScore: number;
}

// SearchExplain（推薦理由）
export interface SearchExplain {
  matchedFacts: {
    factType: string;
    factValue: string;
    reason: string;
  }[];
  categoryMatch: boolean;
  summary: string;
  // ハイブリッド検索で追加
  matchedChunks?: MatchedChunk[];
  relevanceHighlights?: string[];
}

// SearchResult（検索結果）
export interface SearchResult {
  id: string;
  run_id: string;
  solution_id: string;
  rank: number;
  score: number;
  score_breakdown: ScoreBreakdown | null;
  explain: SearchExplain | null;
  concerns: string[];
  questions_for_vendor: string[];
  created_at: string;
  // 結合データ
  solution?: Solution;
  facts?: SolutionFact[];
}

// 検索結果（UIで使用する拡張型）
export interface SearchResultWithSolution extends SearchResult {
  solution: Solution;
  facts: SolutionFact[];
}
