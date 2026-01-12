"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HistoryFilters } from "@/types/history";
import type { Category, SessionStatus } from "@/types/diagnosis";
import { CATEGORY_LABELS } from "@/types/diagnosis";
import { X, Loader2 } from "lucide-react";

interface HistoryFiltersProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
}

const STATUS_OPTIONS: Array<{ value: SessionStatus | "all"; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "in_progress", label: "作業中" },
  { value: "completed", label: "完了" },
  { value: "archived", label: "アーカイブ" },
];

const CATEGORY_OPTIONS: Array<{ value: Category | "all"; label: string }> = [
  { value: "all", label: "すべて" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as Category,
    label,
  })),
];

const PERIOD_OPTIONS: Array<{
  value: "all" | "today" | "week" | "month";
  label: string;
}> = [
  { value: "all", label: "全期間" },
  { value: "today", label: "今日" },
  { value: "week", label: "過去7日" },
  { value: "month", label: "過去30日" },
];

function HistoryFiltersContent({
  filters,
  onFiltersChange,
}: HistoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: keyof HistoryFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);

    // URLパラメータを更新
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    onFiltersChange({ status: "all", category: "all", period: "all" });
    router.push("/dashboard/history", { scroll: false });
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.period !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* ステータスフィルター */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) => updateFilter("status", value)}
      >
        <SelectTrigger className="h-8 w-[130px] text-[13px]">
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-[13px]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* カテゴリフィルター */}
      <Select
        value={filters.category || "all"}
        onValueChange={(value) => updateFilter("category", value)}
      >
        <SelectTrigger className="h-8 w-[140px] text-[13px]">
          <SelectValue placeholder="カテゴリ" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-[13px]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 期間フィルター */}
      <Select
        value={filters.period || "all"}
        onValueChange={(value) => updateFilter("period", value)}
      >
        <SelectTrigger className="h-8 w-[120px] text-[13px]">
          <SelectValue placeholder="期間" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-[13px]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* フィルタークリア */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-[12px] text-muted-foreground hover:text-foreground"
          onClick={clearFilters}
        >
          <X className="h-3.5 w-3.5" />
          クリア
        </Button>
      )}
    </div>
  );
}

export function HistoryFilters(props: HistoryFiltersProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground">読み込み中...</span>
        </div>
      }
    >
      <HistoryFiltersContent {...props} />
    </Suspense>
  );
}
