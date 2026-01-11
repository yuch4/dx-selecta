/**
 * スコアリングアルゴリズム
 * 
 * 設計書に基づき、BM25スコア、ベクトルスコア、ファクトマッチスコアを
 * 統合して最終スコアを算出する。
 */

import type { FinalScoreParams } from "./types";

// スコア統合の重み
const BM25_WEIGHT = 0.4;  // BM25の重み
const VECTOR_WEIGHT = 0.6; // ベクトル検索の重み
const RELEVANCE_WEIGHT = 0.5; // 関連度スコアの全体重み
const FACT_MATCH_WEIGHT = 0.5; // ファクトマッチの全体重み

/**
 * 関連度スコアを計算（BM25 + ベクトル検索）
 * @param bm25Score - BM25スコア（0-1正規化済み）
 * @param vectorScore - ベクトル類似度（0-1）
 * @returns 関連度スコア（0-1）
 */
export function calculateRelevanceScore(
  bm25Score: number,
  vectorScore: number
): number {
  return bm25Score * BM25_WEIGHT + vectorScore * VECTOR_WEIGHT;
}

/**
 * 最終スコアを計算
 * 
 * アルゴリズム（設計書準拠）:
 * 1. 関連度スコア = BM25 * 0.4 + ベクトル * 0.6（事前計算済み）
 * 2. 最終スコア = (関連度 * 0.5 + ファクトマッチ * 0.5) * 100
 *    + カテゴリマッチボーナス（+10）
 * 
 * @param params - スコア計算パラメータ
 * @returns 最終スコア（0-100）
 */
export function calculateFinalScore(params: FinalScoreParams): number {
  const { relevanceScore, factMatchScore, categoryMatch } = params;
  
  // 最終スコア（0-100）
  let finalScore = (relevanceScore * RELEVANCE_WEIGHT + factMatchScore * FACT_MATCH_WEIGHT) * 100;
  
  // カテゴリマッチボーナス
  if (categoryMatch) {
    finalScore += 10;
  }
  
  return Math.min(Math.max(finalScore, 0), 100);
}

/**
 * ファクトマッチスコアを計算
 * 
 * @param matchedCount - マッチしたファクト数
 * @param totalRequired - 必須条件の総数
 * @returns ファクトマッチスコア（0-1）
 */
export function calculateFactMatchScore(
  matchedCount: number,
  totalRequired: number
): number {
  if (totalRequired === 0) return 1; // 必須条件なしは全マッチ扱い
  return matchedCount / totalRequired;
}

/**
 * BM25スコアを0-1に正規化
 * 
 * @param score - 生のBM25スコア
 * @param maxScore - 最大スコア（正規化基準）
 * @returns 正規化スコア（0-1）
 */
export function normalizeBm25Score(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.min(score / maxScore, 1);
}

/**
 * ベクトル距離をスコアに変換
 * pgvector の <=> (コサイン距離) は 0-2 の範囲なので、類似度に変換
 * 
 * @param distance - コサイン距離（0-2）
 * @returns コサイン類似度（0-1）
 */
export function distanceToSimilarity(distance: number): number {
  // コサイン距離 = 1 - コサイン類似度 なので
  // 類似度 = 1 - 距離
  return Math.max(1 - distance, 0);
}
