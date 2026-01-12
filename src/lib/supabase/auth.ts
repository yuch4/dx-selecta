import { createClient } from "./server";

/**
 * 認証エラー
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * テナントメンバーシップ情報
 */
export interface TenantUserContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  tenantId: string;
}

/**
 * 認証済みテナントユーザーを取得
 * @throws {AuthError} 認証されていない場合、またはテナントが見つからない場合
 */
export async function requireTenantUser(): Promise<TenantUserContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthError("認証が必要です");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (membershipError || !membership) {
    throw new AuthError("テナントが見つかりません");
  }

  return {
    supabase,
    userId: user.id,
    tenantId: membership.tenant_id,
  };
}

/**
 * 認証済みユーザーを取得（テナント不要の場合）
 * @throws {AuthError} 認証されていない場合
 */
export async function requireUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthError("認証が必要です");
  }

  return {
    supabase,
    userId: user.id,
  };
}
