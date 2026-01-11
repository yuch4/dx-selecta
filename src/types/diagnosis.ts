// 診断関連の型定義

// 会社規模
export type CompanySize = '1-50' | '51-100' | '101-300' | '301-1000' | '1001+';

// カテゴリ
export type Category = 
  | 'accounting' 
  | 'expense' 
  | 'attendance' 
  | 'hr' 
  | 'workflow' 
  | 'e_contract' 
  | 'invoice' 
  | 'procurement';

// セッションステータス
export type SessionStatus = 'in_progress' | 'completed' | 'archived';

// データ保管地域
export type DataResidency = 'japan' | 'any' | null;

// Must条件
export interface DiagnosisConstraints {
  budgetMax: number | null;        // 月額上限（円）
  deployDeadline: string | null;   // 導入期限（ISO日付文字列）
  requiredLanguages: string[];     // 必要言語 ['ja', 'en']
  requireSso: boolean;             // SSO必須
  requireAuditLog: boolean;        // 監査ログ必須
  dataResidency: DataResidency;    // データ保管地域
}

// 重み付け
export interface DiagnosisWeights {
  operationEase: number;    // 運用負荷 (0-10)
  deploymentEase: number;   // 導入難易度 (0-10)
  integrations: number;     // 連携 (0-10)
  security: number;         // セキュリティ (0-10)
  price: number;            // 価格 (0-10)
}

// 診断入力（フォーム用）
export interface DiagnosisFormData {
  // 会社属性
  companyIndustry: string;
  companySize: CompanySize;
  companyRegion: string;
  
  // カテゴリ
  category: Category;
  
  // 課題
  problems: string[];
  problemFreeText: string;
  
  // Must条件
  constraints: DiagnosisConstraints;
  
  // 重み付け
  weights: DiagnosisWeights;
}

// デフォルト値
export const DEFAULT_CONSTRAINTS: DiagnosisConstraints = {
  budgetMax: null,
  deployDeadline: null,
  requiredLanguages: ['ja'],
  requireSso: false,
  requireAuditLog: false,
  dataResidency: null,
};

export const DEFAULT_WEIGHTS: DiagnosisWeights = {
  operationEase: 5,
  deploymentEase: 5,
  integrations: 5,
  security: 5,
  price: 5,
};

export const DEFAULT_FORM_DATA: DiagnosisFormData = {
  companyIndustry: '',
  companySize: '51-100',
  companyRegion: '関東',
  category: 'expense',
  problems: [],
  problemFreeText: '',
  constraints: DEFAULT_CONSTRAINTS,
  weights: DEFAULT_WEIGHTS,
};

// カテゴリのラベル
export const CATEGORY_LABELS: Record<Category, string> = {
  accounting: '会計ソフト',
  expense: '経費精算',
  attendance: '勤怠管理',
  hr: '人事労務',
  workflow: 'ワークフロー',
  e_contract: '電子契約',
  invoice: '請求書受領',
  procurement: '購買管理',
};

// 会社規模のラベル
export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  '1-50': '1〜50名',
  '51-100': '51〜100名',
  '101-300': '101〜300名',
  '301-1000': '301〜1000名',
  '1001+': '1001名以上',
};

// 業種リスト
export const INDUSTRIES = [
  '情報通信業',
  '製造業',
  '小売業',
  'サービス業',
  '金融・保険業',
  '不動産業',
  '医療・福祉',
  '教育・学習支援',
  '建設業',
  '運輸業',
  '飲食業',
  'その他',
] as const;

// 地域リスト
export const REGIONS = [
  '北海道',
  '東北',
  '関東',
  '中部',
  '近畿',
  '中国',
  '四国',
  '九州・沖縄',
] as const;

// 課題リスト（カテゴリ共通）
export const COMMON_PROBLEMS = [
  '手作業が多く効率が悪い',
  'Excelでの管理が限界',
  '承認フローが煩雑',
  'リモートワーク対応が不十分',
  '他システムとの連携ができていない',
  'セキュリティに不安がある',
  '法改正への対応が大変',
  'コストを削減したい',
  '属人化を解消したい',
  '監査対応を強化したい',
] as const;
