/**
 * 日付を相対時間形式でフォーマット
 * @param dateString ISO日付文字列
 * @returns フォーマット済み文字列（例: "5分前", "3日前", "2024年1月15日"）
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "たった今";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  }
  if (diffHours < 24) {
    return `${diffHours}時間前`;
  }
  if (diffDays < 7) {
    return `${diffDays}日前`;
  }

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * 日付を日本語形式でフォーマット
 * @param dateString ISO日付文字列
 * @returns フォーマット済み文字列（例: "2024年1月15日 14:30"）
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 期間フィルターの開始日を計算
 * @param period フィルター期間
 * @returns 開始日のISO文字列
 */
export function getPeriodStartDate(
  period: "today" | "week" | "month" | "all"
): string | null {
  if (period === "all") return null;

  const now = new Date();

  switch (period) {
    case "today":
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).toISOString();
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return null;
  }
}
