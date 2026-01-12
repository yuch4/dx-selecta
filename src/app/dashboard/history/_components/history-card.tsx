"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HistoryItem } from "@/types/history";
import {
  ClipboardList,
  GitCompare,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle2,
  Archive,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";

interface HistoryCardProps {
  item: HistoryItem;
}

const statusConfig = {
  in_progress: {
    label: "作業中",
    variant: "default" as const,
    icon: Clock,
    color: "text-blue-600",
  },
  completed: {
    label: "完了",
    variant: "secondary" as const,
    icon: CheckCircle2,
    color: "text-green-600",
  },
  archived: {
    label: "アーカイブ",
    variant: "outline" as const,
    icon: Archive,
    color: "text-muted-foreground",
  },
};

const typeConfig = {
  diagnosis: {
    icon: ClipboardList,
    label: "診断",
    color: "bg-blue-500/10 text-blue-600",
  },
  comparison: {
    icon: GitCompare,
    label: "比較",
    color: "bg-purple-500/10 text-purple-600",
  },
  proposal: {
    icon: FileText,
    label: "稟議書",
    color: "bg-green-500/10 text-green-600",
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return `${mins}分前`;
  }
  if (diffHours < 24) {
    return `${Math.floor(diffHours)}時間前`;
  }
  if (diffDays < 7) {
    return `${Math.floor(diffDays)}日前`;
  }

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function HistoryCard({ item }: HistoryCardProps) {
  const status = statusConfig[item.status];
  const type = typeConfig[item.type];
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  // 遷移先を決定
  const getHref = () => {
    if (item.status === "in_progress") {
      return `/dashboard/diagnosis?session=${item.sessionId}`;
    }
    return `/dashboard/history/${item.sessionId}`;
  };

  return (
    <Card className="group overflow-hidden border-border/50 transition-all duration-200 hover:border-border hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* 左側: アイコンと情報 */}
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${type.color}`}
            >
              <TypeIcon className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-medium leading-tight">
                  {item.title}
                </h3>
                <Badge
                  variant={status.variant}
                  className="h-5 gap-1 px-1.5 text-[10px]"
                >
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>

              <p className="text-[12px] text-muted-foreground">
                {item.description}
              </p>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] text-muted-foreground">
                  {formatDate(item.updatedAt)}
                </span>

                {/* 進捗表示（作業中の場合） */}
                {item.status === "in_progress" &&
                  item.currentStep !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 w-4 rounded-full ${
                              step <= (item.currentStep || 0)
                                ? "bg-primary"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {item.currentStep}/{item.totalSteps}
                      </span>
                    </div>
                  )}

                {/* 関連データアイコン */}
                <div className="flex items-center gap-1">
                  {item.hasSearchRun && (
                    <span
                      className="text-[10px] text-muted-foreground"
                      title="検索結果あり"
                    >
                      🔍
                    </span>
                  )}
                  {item.hasComparison && (
                    <span
                      className="text-[10px] text-muted-foreground"
                      title="比較マトリクスあり"
                    >
                      📊
                    </span>
                  )}
                  {item.hasProposal && (
                    <span
                      className="text-[10px] text-muted-foreground"
                      title="稟議書あり"
                    >
                      📄
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右側: アクションボタン */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <Link href={getHref()}>
              {item.status === "in_progress" ? (
                <>
                  <PlayCircle className="h-3.5 w-3.5" />
                  再開
                </>
              ) : (
                <>
                  詳細
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
