"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { DiagnosisFormData } from "@/types/diagnosis";

// セッション作成
export async function createSession(tenantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }
  
  const { data, error } = await supabase
    .from("diagnosis_sessions")
    .insert({
      tenant_id: tenantId,
      user_id: user.id,
      status: "in_progress",
    })
    .select()
    .single();
  
  if (error) {
    console.error("Session creation error:", error);
    throw new Error("セッションの作成に失敗しました");
  }
  
  return data;
}

// 診断入力を保存
export async function saveInput(sessionId: string, formData: DiagnosisFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }
  
  // 既存の入力があれば更新、なければ作成
  const { data: existing } = await supabase
    .from("diagnosis_inputs")
    .select("id")
    .eq("session_id", sessionId)
    .single();
  
  const inputData = {
    session_id: sessionId,
    company_industry: formData.companyIndustry,
    company_size: formData.companySize,
    company_region: formData.companyRegion,
    category: formData.category,
    problems: formData.problems,
    problem_free_text: formData.problemFreeText || null,
    constraints: formData.constraints,
    weights: formData.weights,
  };
  
  if (existing) {
    const { error } = await supabase
      .from("diagnosis_inputs")
      .update(inputData)
      .eq("id", existing.id);
    
    if (error) {
      console.error("Input update error:", error);
      throw new Error("入力の更新に失敗しました");
    }
  } else {
    const { error } = await supabase
      .from("diagnosis_inputs")
      .insert(inputData);
    
    if (error) {
      console.error("Input creation error:", error);
      throw new Error("入力の保存に失敗しました");
    }
  }
  
  return { success: true };
}

// セッション完了
export async function completeSession(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }
  
  const { error } = await supabase
    .from("diagnosis_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("user_id", user.id);
  
  if (error) {
    console.error("Session completion error:", error);
    throw new Error("セッションの完了に失敗しました");
  }
  
  redirect(`/dashboard/search?sessionId=${sessionId}`);
}

// 現在のユーザーのテナントを取得
export async function getUserTenant(): Promise<unknown | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // ユーザーが所属するテナントを取得
  const { data: membership, error: membershipError } = await supabase
    .from("tenant_members")
    .select("tenant_id, tenants(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    console.error("Tenant membership fetch error:", membershipError);
    return null;
  }

  if (!membership) {
    // テナントがない場合は自動作成
    const { data: newTenant, error } = await supabase
      .rpc("create_tenant_with_owner", { tenant_name: "マイ組織" });

    if (error) {
      console.error("Tenant creation error:", error);
      return null;
    }

    const tenantId = typeof newTenant === "string"
      ? newTenant
      : newTenant?.id ?? newTenant?.tenant_id;

    if (!tenantId) {
      console.error("Tenant creation returned no id:", newTenant);
      return null;
    }

    // 作成したテナントを取得
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .maybeSingle();

    if (tenantError) {
      console.error("Tenant fetch error:", tenantError);
      return null;
    }

    return tenant;
  }

  if (membership.tenants) {
    return membership.tenants;
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", membership.tenant_id)
    .maybeSingle();

  if (tenantError) {
    console.error("Tenant fetch error:", tenantError);
    return null;
  }

  return tenant;
}

// セッション取得
export async function getSession(sessionId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("diagnosis_sessions")
    .select(`
      *,
      diagnosis_inputs(*)
    `)
    .eq("id", sessionId)
    .single();
  
  if (error) {
    console.error("Session fetch error:", error);
    return null;
  }
  
  return data;
}
