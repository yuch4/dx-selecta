"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SessionDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーをログサービスに送信（本番環境用）
    console.error("Session detail error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16">
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center space-y-4 pt-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">エラーが発生しました</h2>
            <p className="text-sm text-muted-foreground">
              セッション情報の取得中にエラーが発生しました。
              <br />
              しばらく待ってから再度お試しください。
            </p>
          </div>

          {error.digest && (
            <p className="text-xs text-muted-foreground">
              エラーID: {error.digest}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href="/dashboard/history">
                <ArrowLeft className="h-4 w-4" />
                履歴一覧に戻る
              </Link>
            </Button>
            <Button size="sm" className="gap-1.5" onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              再試行
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
