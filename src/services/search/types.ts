/**
 * ハイブリッド検索関連の型定義
 */

// ハイブリッド検索のパラメータ
export interface HybridSearchParams {
  /** 検索クエリ（課題・要件から生成） */
  query: string;
  /** Mustフィルタ後の候補ソリューションID */
  solutionIds: string[];
  /** 取得件数（デフォルト5） */
  limit?: number;
}

// マッチしたチャンク情報
export interface MatchedChunk {
  /** チャンクID */
  chunkId: string;
  /** ソリューションID */
  solutionId: string;
  /** ドキュメント種別 */
  docType: string;
  /** コンテンツ（テキスト抜粋） */
  content: string;
  /** 元URL */
  sourceUrl: string | null;
  /** BM25スコア（0-1正規化） */
  bm25Score: number;
  /** ベクトル類似度スコア（0-1） */
  vectorScore: number;
  /** 統合スコア（0-1） */
  combinedScore: number;
}

// ハイブリッド検索結果（ソリューション単位）
export interface HybridSearchResult {
  /** ソリューションID */
  solutionId: string;
  /** BM25スコア（0-1正規化、チャンク最大値） */
  bm25Score: number;
  /** ベクトルスコア（0-1、チャンク最大値） */
  vectorScore: number;
  /** 統合スコア（0-1） */
  combinedScore: number;
  /** マッチしたチャンク */
  matchedChunks: MatchedChunk[];
}

// 診断入力の重み設定
export interface DiagnosisWeights {
  operationEase: number;
  deploymentEase: number;
  integrations: number;
  security: number;
  price: number;
}

// 最終スコア計算のパラメータ
export interface FinalScoreParams {
  /** 関連度スコア（0-1、BM25+Vectorの統合値） */
  relevanceScore: number;
  /** ファクトマッチスコア（0-1） */
  factMatchScore: number;
  /** カテゴリマッチ */
  categoryMatch: boolean;
  /** ユーザー指定の重み */
  weights?: DiagnosisWeights;
}
