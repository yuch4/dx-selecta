import type { SessionStatus } from "@/types/diagnosis";

/**
 * ステータス表示設定
 */
export const STATUS_CONFIG: Record<
  SessionStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline";
    color: string;
  }
> = {
  in_progress: {
    label: "作業中",
    variant: "default",
    color: "text-blue-600",
  },
  completed: {
    label: "完了",
    variant: "secondary",
    color: "text-green-600",
  },
  archived: {
    label: "アーカイブ",
    variant: "outline",
    color: "text-muted-foreground",
  },
};

/**
 * 履歴タイプ表示設定
 */
export const HISTORY_TYPE_CONFIG = {
  diagnosis: {
    label: "診断",
    color: "bg-blue-500/10 text-blue-600",
  },
  comparison: {
    label: "比較",
    color: "bg-purple-500/10 text-purple-600",
  },
  proposal: {
    label: "稟議書",
    color: "bg-green-500/10 text-green-600",
  },
} as const;

export type HistoryType = keyof typeof HISTORY_TYPE_CONFIG;
