import { describe, it, expect } from "vitest";
import {
  STATUS_CONFIG,
  HISTORY_TYPE_CONFIG,
} from "@/lib/history/constants";

describe("STATUS_CONFIG", () => {
  it("in_progress ステータスの設定が正しい", () => {
    expect(STATUS_CONFIG.in_progress).toEqual({
      label: "作業中",
      variant: "default",
      color: "text-blue-600",
    });
  });

  it("completed ステータスの設定が正しい", () => {
    expect(STATUS_CONFIG.completed).toEqual({
      label: "完了",
      variant: "secondary",
      color: "text-green-600",
    });
  });

  it("archived ステータスの設定が正しい", () => {
    expect(STATUS_CONFIG.archived).toEqual({
      label: "アーカイブ",
      variant: "outline",
      color: "text-muted-foreground",
    });
  });

  it("すべてのSessionStatusに対応する設定がある", () => {
    const expectedStatuses = ["in_progress", "completed", "archived"];
    expectedStatuses.forEach((status) => {
      expect(STATUS_CONFIG).toHaveProperty(status);
    });
  });
});

describe("HISTORY_TYPE_CONFIG", () => {
  it("diagnosis タイプの設定が正しい", () => {
    expect(HISTORY_TYPE_CONFIG.diagnosis).toEqual({
      label: "診断",
      color: "bg-blue-500/10 text-blue-600",
    });
  });

  it("comparison タイプの設定が正しい", () => {
    expect(HISTORY_TYPE_CONFIG.comparison).toEqual({
      label: "比較",
      color: "bg-purple-500/10 text-purple-600",
    });
  });

  it("proposal タイプの設定が正しい", () => {
    expect(HISTORY_TYPE_CONFIG.proposal).toEqual({
      label: "稟議書",
      color: "bg-green-500/10 text-green-600",
    });
  });
});
