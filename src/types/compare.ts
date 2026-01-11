// 比較機能関連の型定義

// 比較軸
export interface ComparisonAxis {
  id: string;
  name: string;
  order: number;
}

// 比較セル
export type CellStatus = 'confirmed' | 'needs_verification' | 'not_available';

export interface ComparisonCell {
  solutionId: string;
  axisId: string;
  value: string;
  status: CellStatus;
  evidenceUrl: string | null;
}

// 比較マトリクス
export interface ComparisonMatrix {
  id: string;
  run_id: string;
  solutions: string[];
  axes: ComparisonAxis[];
  cells: ComparisonCell[];
  created_at: string;
}

// 比較用のソリューションデータ（UIで使用）
export interface ComparisonSolution {
  id: string;
  name: string;
  vendor: string;
  category: string;
  description: string | null;
  website_url: string | null;
  score: number;
  rank: number;
}

// 比較マトリクス（ソリューション情報付き）
export interface ComparisonMatrixWithSolutions extends ComparisonMatrix {
  solutionDetails: ComparisonSolution[];
}

// デフォルト比較軸
export const DEFAULT_AXES: ComparisonAxis[] = [
  { id: 'vendor', name: 'ベンダー', order: 1 },
  { id: 'category', name: 'カテゴリ', order: 2 },
  { id: 'sso', name: 'SSO対応', order: 3 },
  { id: 'audit_log', name: '監査ログ', order: 4 },
  { id: 'api', name: 'API', order: 5 },
  { id: 'mobile', name: 'モバイル', order: 6 },
  { id: 'score', name: 'スコア', order: 7 },
];

// カテゴリ表示名
export const CATEGORY_LABELS: Record<string, string> = {
  accounting: '会計',
  expense: '経費精算',
  attendance: '勤怠管理',
  hr: '人事労務',
  workflow: 'ワークフロー',
  e_contract: '電子契約',
  invoice: '請求書',
  procurement: '調達',
};
