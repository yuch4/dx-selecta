"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, RefreshCw, Loader2 } from "lucide-react";
import { HistoryList } from "./_components/history-list";
import { HistoryFilters } from "./_components/history-filters";
import { getHistoryList } from "./actions";
import type { HistoryItem, HistoryFilters as Filters } from "@/types/history";

function HistoryPageContent() {
  const searchParams = useSearchParams();
  
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // URLパラメータからフィルターを初期化
  const [filters, setFilters] = useState<Filters>(() => ({
    status: (searchParams.get("status") as Filters["status"]) || "all",
    category: (searchParams.get("category") as Filters["category"]) || "all",
    period: (searchParams.get("period") as Filters["period"]) || "all",
  }));

  const loadHistory = useCallback(async (reset: boolean = true) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const offset = reset ? 0 : items.length;
      const result = await getHistoryList(filters, 20, offset);
      
      if (reset) {
        setItems(result.items);
      } else {
        setItems((prev) => [...prev, ...result.items]);
      }
      
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch {
      setError("履歴の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [filters, items.length]);

  // フィルター変更時にリロード
  useEffect(() => {
    loadHistory(true);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    loadHistory(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">履歴</h1>
          <p className="text-[13px] text-muted-foreground">
            過去の診断・比較・稟議書を確認できます
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-[13px]"
          onClick={() => loadHistory(true)}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          更新
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-[14px] font-medium">
            <History className="h-4 w-4" />
            フィルター
            {total > 0 && (
              <span className="ml-auto text-[12px] font-normal text-muted-foreground">
                {total}件
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <HistoryFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-[13px] text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[12px]"
              onClick={() => loadHistory(true)}
            >
              再試行
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <HistoryList items={items} isLoading={isLoading && items.length === 0} />

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 text-[13px]"
            onClick={handleLoadMore}
          >
            さらに読み込む
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoading && items.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">履歴</h1>
              <p className="text-[13px] text-muted-foreground">
                過去の診断・比較・稟議書を確認できます
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      }
    >
      <HistoryPageContent />
    </Suspense>
  );
}
