import { describe, it, expect } from "vitest";
import {
  formatRelativeDate,
  formatDateTime,
  getPeriodStartDate,
} from "@/lib/history/utils";

describe("formatRelativeDate", () => {
  it("1分未満は「たった今」と表示する", () => {
    const now = new Date().toISOString();
    expect(formatRelativeDate(now)).toBe("たった今");
  });

  it("1時間未満は「N分前」と表示する", () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(formatRelativeDate(thirtyMinsAgo)).toBe("30分前");
  });

  it("24時間未満は「N時間前」と表示する", () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeDate(fiveHoursAgo)).toBe("5時間前");
  });

  it("7日未満は「N日前」と表示する", () => {
    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(formatRelativeDate(threeDaysAgo)).toBe("3日前");
  });

  it("7日以上前は日付形式で表示する", () => {
    const twoWeeksAgo = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000
    ).toISOString();
    const result = formatRelativeDate(twoWeeksAgo);
    // 年月日形式であることを確認
    expect(result).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);
  });
});

describe("formatDateTime", () => {
  it("日本語形式の日時文字列を返す", () => {
    const date = "2026-01-12T14:30:00.000Z";
    const result = formatDateTime(date);
    // 日本語形式であることを確認
    expect(result).toContain("2026年");
    expect(result).toContain("月");
    expect(result).toContain("日");
  });
});

describe("getPeriodStartDate", () => {
  it("allの場合はnullを返す", () => {
    expect(getPeriodStartDate("all")).toBeNull();
  });

  it("todayの場合は今日の0時を返す", () => {
    const result = getPeriodStartDate("today");
    expect(result).not.toBeNull();

    const resultDate = new Date(result!);
    const now = new Date();

    expect(resultDate.getFullYear()).toBe(now.getFullYear());
    expect(resultDate.getMonth()).toBe(now.getMonth());
    expect(resultDate.getDate()).toBe(now.getDate());
    expect(resultDate.getHours()).toBe(0);
    expect(resultDate.getMinutes()).toBe(0);
  });

  it("weekの場合は7日前の日付を返す", () => {
    const result = getPeriodStartDate("week");
    expect(result).not.toBeNull();

    const resultDate = new Date(result!);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1秒以内の誤差は許容
    expect(Math.abs(resultDate.getTime() - sevenDaysAgo.getTime())).toBeLessThan(
      1000
    );
  });

  it("monthの場合は30日前の日付を返す", () => {
    const result = getPeriodStartDate("month");
    expect(result).not.toBeNull();

    const resultDate = new Date(result!);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1秒以内の誤差は許容
    expect(
      Math.abs(resultDate.getTime() - thirtyDaysAgo.getTime())
    ).toBeLessThan(1000);
  });
});
