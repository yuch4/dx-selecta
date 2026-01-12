"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HistoryItem } from "@/types/history";
import { STATUS_CONFIG, HISTORY_TYPE_CONFIG } from "@/lib/history";
import { formatRelativeDate } from "@/lib/history";
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

// アイコンマッピング
const statusIcons = {
  in_progress: Clock,
  completed: CheckCircle2,
  archived: Archive,
};

const typeIcons = {
  diagnosis: ClipboardList,
  comparison: GitCompare,
  proposal: FileText,
};

export function HistoryCard({ item }: HistoryCardProps) {
  const status = STATUS_CONFIG[item.status];
  const type = HISTORY_TYPE_CONFIG[item.type];
  const StatusIcon = statusIcons[item.status];
  const TypeIcon = typeIcons[item.type];

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
                  {formatRelativeDate(item.updatedAt)}
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
