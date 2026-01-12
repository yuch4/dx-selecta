import { describe, it, expect } from "vitest";
import { AuthError } from "@/lib/supabase/auth";

// AuthErrorクラスのテスト
describe("AuthError", () => {
  it("エラーメッセージを正しく設定する", () => {
    const error = new AuthError("認証が必要です");
    expect(error.message).toBe("認証が必要です");
    expect(error.name).toBe("AuthError");
  });

  it("Errorクラスを継承している", () => {
    const error = new AuthError("test");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
  });
});

// 注意: requireTenantUser/requireUserの実際のテストは
// Supabaseクライアントのモックが複雑なため、統合テストで実施
