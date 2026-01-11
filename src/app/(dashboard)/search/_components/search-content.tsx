"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SearchHeader } from "@/components/search/search-header";
import { SearchResultList } from "@/components/search/search-result-list";
import { CompareActionBar } from "@/components/search/compare-action-bar";
import { runSearch, getSearchResults, getLatestSearchRun } from "../actions";
import type { SearchRun, SearchResultWithSolution } from "@/types/search";
import { Loader2 } from "lucide-react";

export function SearchContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  
  const [searchRun, setSearchRun] = useState<SearchRun | null>(null);
  const [results, setResults] = useState<SearchResultWithSolution[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 検索実行
  const executeSearch = useCallback(async (sessionIdParam: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 既存の検索結果があるかチェック
      let run = await getLatestSearchRun(sessionIdParam);
      
      // なければ新規検索
      if (!run) {
        run = await runSearch(sessionIdParam);
      }
      
      setSearchRun(run);
      
      // 結果を取得
      const searchResults = await getSearchResults(run.id);
      setResults(searchResults);
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 初回ロード
  useEffect(() => {
    if (sessionId) {
      executeSearch(sessionId);
    } else {
      setIsLoading(false);
      setError("セッションIDが指定されていません。診断を先に完了してください。");
    }
  }, [sessionId, executeSearch]);
  
  // 再検索
  const handleRerun = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const run = await runSearch(sessionId);
      setSearchRun(run);
      const searchResults = await getSearchResults(run.id);
      setResults(searchResults);
    } catch (err) {
      console.error("Re-search error:", err);
      setError(err instanceof Error ? err.message : "再検索に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 選択トグル
  const handleToggleSelect = (solutionId: string) => {
    setSelectedIds((prev) =>
      prev.includes(solutionId)
        ? prev.filter((id) => id !== solutionId)
        : [...prev, solutionId]
    );
  };
  
  // ローディング中
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">検索中...</p>
      </div>
    );
  }
  
  // エラー時
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          <a href="/diagnosis" className="underline hover:text-primary">
            診断ページへ戻る
          </a>
        </p>
      </div>
    );
  }
  
  return (
    <>
      {/* 診断条件サマリ */}
      {searchRun && (
        <SearchHeader
          inputSnapshot={searchRun.input_snapshot}
          totalCandidates={searchRun.total_candidates}
          durationMs={searchRun.duration_ms}
        />
      )}
      
      {/* 検索結果一覧 */}
      <SearchResultList
        results={results}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />
      
      {/* 比較アクションバー */}
      {sessionId && (
        <CompareActionBar
          selectedIds={selectedIds}
          sessionId={sessionId}
          runId={searchRun?.id || null}
          onRerun={handleRerun}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
