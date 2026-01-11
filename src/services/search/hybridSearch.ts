/**
 * ハイブリッド検索サービス
 * 
 * BM25全文検索 + pgvectorベクトル検索を組み合わせた
 * ハイブリッド検索を実行する。
 */

import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/openai/client";
import {
  normalizeBm25Score,
  distanceToSimilarity,
  calculateRelevanceScore,
} from "./scoringAlgorithm";
import type { HybridSearchParams, HybridSearchResult, MatchedChunk } from "./types";

// 検索設定
const DEFAULT_LIMIT = 5;
const MAX_CHUNKS_PER_SOLUTION = 3;

/**
 * ハイブリッド検索を実行
 * 
 * 1. クエリをEmbeddingに変換
 * 2. BM25検索（PostgreSQL ts_rank）
 * 3. ベクトル検索（pgvector）
 * 4. スコア統合・ソリューション単位で集約
 * 
 * @param params - 検索パラメータ
 * @returns ソリューション単位の検索結果（スコア降順）
 */
export async function hybridSearch(
  params: HybridSearchParams
): Promise<HybridSearchResult[]> {
  const { query, solutionIds, limit = DEFAULT_LIMIT } = params;

  if (solutionIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  // 1. BM25検索
  const bm25Results = await executeBm25Search(supabase, query, solutionIds);

  // 2. ベクトル検索
  let vectorResults: VectorSearchResult[] = [];
  try {
    const queryEmbedding = await generateEmbedding(query);
    vectorResults = await executeVectorSearch(supabase, queryEmbedding, solutionIds);
  } catch (error) {
    // Embedding生成失敗時はBM25のみで進行
    console.warn("Vector search skipped due to embedding error:", error);
  }

  // 3. 結果を統合
  const mergedResults = mergeSearchResults(bm25Results, vectorResults, solutionIds);

  // 4. スコア降順でソートしてlimit件返却
  return mergedResults
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit);
}

// --- 内部型定義 ---

interface Bm25SearchResult {
  chunkId: string;
  solutionId: string;
  docType: string;
  content: string;
  sourceUrl: string | null;
  rank: number;
}

interface VectorSearchResult {
  chunkId: string;
  solutionId: string;
  docType: string;
  content: string;
  sourceUrl: string | null;
  distance: number;
}

// --- 内部関数 ---

/**
 * BM25全文検索を実行
 */
async function executeBm25Search(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  solutionIds: string[]
): Promise<Bm25SearchResult[]> {
  // PostgreSQL ts_rank を使用したBM25検索
  const { data, error } = await supabase.rpc("search_chunks_bm25", {
    search_query: query,
    solution_ids: solutionIds,
    max_results: solutionIds.length * MAX_CHUNKS_PER_SOLUTION,
  });

  if (error) {
    console.error("BM25 search error:", error);
    return [];
  }

  return (data || []).map((row: {
    id: string;
    solution_id: string;
    doc_type: string;
    content: string;
    source_url: string | null;
    rank: number;
  }) => ({
    chunkId: row.id,
    solutionId: row.solution_id,
    docType: row.doc_type,
    content: row.content,
    sourceUrl: row.source_url,
    rank: row.rank,
  }));
}

/**
 * ベクトル検索を実行
 */
async function executeVectorSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  queryEmbedding: number[],
  solutionIds: string[]
): Promise<VectorSearchResult[]> {
  // pgvector を使用したベクトル検索
  const { data, error } = await supabase.rpc("search_chunks_vector", {
    query_embedding: queryEmbedding,
    solution_ids: solutionIds,
    max_results: solutionIds.length * MAX_CHUNKS_PER_SOLUTION,
  });

  if (error) {
    console.error("Vector search error:", error);
    return [];
  }

  return (data || []).map((row: {
    id: string;
    solution_id: string;
    doc_type: string;
    content: string;
    source_url: string | null;
    distance: number;
  }) => ({
    chunkId: row.id,
    solutionId: row.solution_id,
    docType: row.doc_type,
    content: row.content,
    sourceUrl: row.source_url,
    distance: row.distance,
  }));
}

/**
 * BM25結果とベクトル結果を統合してソリューション単位で集約
 */
function mergeSearchResults(
  bm25Results: Bm25SearchResult[],
  vectorResults: VectorSearchResult[],
  solutionIds: string[]
): HybridSearchResult[] {
  // BM25スコアの最大値（正規化用）
  const maxBm25Rank = Math.max(...bm25Results.map((r) => r.rank), 0.001);

  // チャンクIDでマップを作成
  const chunkMap = new Map<string, {
    chunkId: string;
    solutionId: string;
    docType: string;
    content: string;
    sourceUrl: string | null;
    bm25Score: number;
    vectorScore: number;
  }>();

  // BM25結果を追加
  for (const result of bm25Results) {
    chunkMap.set(result.chunkId, {
      chunkId: result.chunkId,
      solutionId: result.solutionId,
      docType: result.docType,
      content: result.content,
      sourceUrl: result.sourceUrl,
      bm25Score: normalizeBm25Score(result.rank, maxBm25Rank),
      vectorScore: 0,
    });
  }

  // ベクトル結果をマージ
  for (const result of vectorResults) {
    const existing = chunkMap.get(result.chunkId);
    if (existing) {
      existing.vectorScore = distanceToSimilarity(result.distance);
    } else {
      chunkMap.set(result.chunkId, {
        chunkId: result.chunkId,
        solutionId: result.solutionId,
        docType: result.docType,
        content: result.content,
        sourceUrl: result.sourceUrl,
        bm25Score: 0,
        vectorScore: distanceToSimilarity(result.distance),
      });
    }
  }

  // ソリューション単位で集約
  const solutionMap = new Map<string, {
    maxBm25: number;
    maxVector: number;
    chunks: MatchedChunk[];
  }>();

  // 全solutionIdを初期化
  for (const solutionId of solutionIds) {
    solutionMap.set(solutionId, {
      maxBm25: 0,
      maxVector: 0,
      chunks: [],
    });
  }

  // チャンクをソリューションに振り分け
  for (const chunk of chunkMap.values()) {
    const solution = solutionMap.get(chunk.solutionId);
    if (!solution) continue;

    solution.maxBm25 = Math.max(solution.maxBm25, chunk.bm25Score);
    solution.maxVector = Math.max(solution.maxVector, chunk.vectorScore);
    const chunkCombinedScore = calculateRelevanceScore(chunk.bm25Score, chunk.vectorScore);
    solution.chunks.push({
      chunkId: chunk.chunkId,
      solutionId: chunk.solutionId,
      docType: chunk.docType,
      content: chunk.content,
      sourceUrl: chunk.sourceUrl,
      bm25Score: chunk.bm25Score,
      vectorScore: chunk.vectorScore,
      combinedScore: chunkCombinedScore,
    });
  }

  // 結果を構築
  const results: HybridSearchResult[] = [];

  for (const [solutionId, data] of solutionMap.entries()) {
    const combinedScore = calculateRelevanceScore(data.maxBm25, data.maxVector);
    
    // チャンクを統合スコア順でソート
    const sortedChunks = data.chunks
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, MAX_CHUNKS_PER_SOLUTION);

    results.push({
      solutionId,
      bm25Score: data.maxBm25,
      vectorScore: data.maxVector,
      combinedScore,
      matchedChunks: sortedChunks,
    });
  }

  return results;
}

/**
 * 検索クエリを生成
 * 診断入力から検索用のクエリ文字列を作成
 */
export function generateSearchQuery(input: {
  category: string;
  problems: string[];
  problemFreeText?: string | null;
}): string {
  const parts: string[] = [];

  // カテゴリ
  const categoryLabels: Record<string, string> = {
    accounting: "会計 経理 決算",
    expense: "経費精算 経費管理 交通費",
    attendance: "勤怠管理 出退勤 シフト",
    hr: "人事労務 入社手続き 年末調整",
    workflow: "ワークフロー 申請 承認",
    e_contract: "電子契約 契約書 署名",
    invoice: "請求書 請求管理",
    procurement: "購買 調達",
  };
  parts.push(categoryLabels[input.category] || input.category);

  // 課題
  if (input.problems.length > 0) {
    parts.push(...input.problems);
  }

  // 自由記述
  if (input.problemFreeText) {
    parts.push(input.problemFreeText);
  }

  return parts.join(" ");
}
