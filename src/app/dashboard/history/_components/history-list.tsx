"use client";

import type { HistoryItem } from "@/types/history";
import { HistoryCard } from "./history-card";
import { FileX } from "lucide-react";

interface HistoryListProps {
  items: HistoryItem[];
  isLoading?: boolean;
}

export function HistoryList({ items, isLoading }: HistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-border/50 bg-muted/50"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileX className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-[15px] font-medium">履歴がありません</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          診断を開始すると、ここに履歴が表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <HistoryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
