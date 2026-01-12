"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CompareTable } from "@/components/compare/compare-table";
import { CompareActions } from "@/components/compare/compare-actions";
import { generateMatrix, getMatrix, exportCsv } from "../actions";
import type { ComparisonMatrixWithSolutions } from "@/types/compare";
import { Loader2 } from "lucide-react";

export function CompareContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const runId = searchParams.get("runId");
  const solutionIds = searchParams.getAll("solutions");
  
  // 配列の参照を安定させるためにキーを作成
  const solutionIdsKey = solutionIds.join(",");
  
  const [matrix, setMatrix] = useState<ComparisonMatrixWithSolutions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // マトリクス生成/取得を一度だけ実行するためのref
  const loadedRef = useRef<string | null>(null);
  
  // マトリクス生成/取得
  const loadMatrix = useCallback(async () => {
    if (!runId) {
      setError("検索結果IDが指定されていません");
      setIsLoading(false);
      return;
    }
    
    // solutionIdsが空の場合は待機（searchParamsがまだ読み込まれていない可能性）
    if (solutionIds.length === 0) {
      return;
    }
    
    // 同じキーで既にロード済みの場合はスキップ
    const loadKey = `${runId}:${solutionIdsKey}`;
    if (loadedRef.current === loadKey) {
      return;
    }
    loadedRef.current = loadKey;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 既存のマトリクスを確認
      let existingMatrix = await getMatrix(runId);
      
      // なければ生成（2件以上必要）
      if (!existingMatrix && solutionIds.length >= 2) {
        await generateMatrix(runId, solutionIds);
        existingMatrix = await getMatrix(runId);
      }
      
      if (!existingMatrix) {
        setError("比較マトリクスの生成に失敗しました。2件以上の製品を選択してください。");
        return;
      }
      
      setMatrix(existingMatrix);
    } catch (err) {
      console.error("Matrix load error:", err);
      setError(err instanceof Error ? err.message : "比較マトリクスの読み込みに失敗しました");
      // エラー時はリトライ可能にする
      loadedRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [runId, solutionIds, solutionIdsKey]);
  
  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);
  
  // CSVエクスポート
  const handleExportCsv = async () => {
    if (!runId) return;
    
    setIsExporting(true);
    try {
      const csv = await exportCsv(runId);
      
      // ダウンロード
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `comparison_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export error:", err);
    } finally {
      setIsExporting(false);
    }
  };
  
  // ローディング中
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">比較表を生成中...</p>
      </div>
    );
  }
  
  // エラー時
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          <a href={sessionId ? `/search?sessionId=${sessionId}` : "/diagnosis"} className="underline hover:text-primary">
            検索結果に戻る
          </a>
        </p>
      </div>
    );
  }
  
  if (!matrix) {
    return null;
  }
  
  // 1位の製品をprimarySolutionIdとして使用
  const primarySolutionId = matrix.solutionDetails[0]?.id || null;
  
  return (
    <div className="space-y-6">
      {/* 比較テーブル */}
      <CompareTable matrix={matrix} />
      
      {/* アクション */}
      {sessionId && runId && (
        <CompareActions
          sessionId={sessionId}
          runId={runId}
          primarySolutionId={primarySolutionId}
          onExportCsv={handleExportCsv}
          isExporting={isExporting}
        />
      )}
    </div>
  );
}
