"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ChevronRight, History, RefreshCw } from "lucide-react";
import { getProposalHistory, type ProposalHistoryItem } from "@/app/dashboard/proposal/actions";

const CATEGORY_LABELS: Record<string, string> = {
  accounting: "会計",
  expense: "経費精算",
  attendance: "勤怠管理",
  hr: "人事労務",
  workflow: "ワークフロー",
  e_contract: "電子契約",
  invoice: "請求書",
  procurement: "調達",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProposalHistory() {
  const [history, setHistory] = useState<ProposalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProposalHistory(10);
      setHistory(data);
    } catch {
      setError("履歴の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            生成履歴
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            生成履歴
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={loadHistory}>
              <RefreshCw className="mr-2 h-4 w-4" />
              再読み込み
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          生成履歴
        </CardTitle>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={loadHistory}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium">まだ履歴がありません</p>
              <p className="text-xs text-muted-foreground mt-1">
                稟議書を生成すると、ここに表示されます
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/dashboard/proposal?id=${item.id}`}
                  className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.solutionName}</span>
                        {item.version > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            v{item.version}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {CATEGORY_LABELS[item.solutionCategory] || item.solutionCategory}
                        </Badge>
                        <span>{item.solutionVendor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {formatDate(item.generatedAt)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
