// 履歴機能関連の型定義

import type { Category, SessionStatus, DiagnosisConstraints, DiagnosisWeights } from './diagnosis';

// 履歴アイテムの種類
export type HistoryItemType = 'diagnosis' | 'comparison' | 'proposal';

// 履歴アイテム（一覧表示用）
export interface HistoryItem {
  id: string;
  sessionId: string;
  type: HistoryItemType;
  status: SessionStatus;
  category: Category;
  categoryLabel: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  
  // 関連データの有無
  hasSearchRun: boolean;
  hasComparison: boolean;
  hasProposal: boolean;
  
  // 診断の進捗（in_progressの場合）
  currentStep?: number;
  totalSteps?: number;
  
  // 稟議書情報（ある場合）
  proposalId?: string;
  primarySolutionName?: string;
}

// 履歴フィルター
export interface HistoryFilters {
  status?: SessionStatus | 'all';
  category?: Category | 'all';
  period?: 'all' | 'today' | 'week' | 'month';
}

// デフォルトフィルター
export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  status: 'all',
  category: 'all',
  period: 'all',
};

// セッション詳細
export interface SessionDetail {
  session: {
    id: string;
    status: SessionStatus;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
  };
  
  // 診断入力
  input: {
    id: string;
    companyIndustry: string;
    companySize: string;
    companyRegion: string;
    category: Category;
    problems: string[];
    problemFreeText: string | null;
    constraints: DiagnosisConstraints;
    weights: DiagnosisWeights;
  } | null;
  
  // 検索実行結果
  searchRuns: Array<{
    id: string;
    executedAt: string;
    totalCandidates: number;
    durationMs: number | null;
    results: Array<{
      id: string;
      rank: number;
      score: number;
      solutionName: string;
      solutionVendor: string;
      concerns: string[];
    }>;
  }>;
  
  // 比較マトリクス
  comparisons: Array<{
    id: string;
    createdAt: string;
    solutions: string[];
    solutionNames: string[];
  }>;
  
  // 稟議出力
  proposals: Array<{
    id: string;
    generatedAt: string;
    format: 'markdown' | 'google_docs';
    version: number;
    primarySolutionName: string;
    markdownText: string | null;
  }>;
}

// 履歴一覧レスポンス
export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
  hasMore: boolean;
}
