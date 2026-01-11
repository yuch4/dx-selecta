import { DiagnosisForm } from "@/components/diagnosis/diagnosis-form";
import { getUserTenant } from "./actions";
import { redirect } from "next/navigation";

export default async function DiagnosisPage() {
  const tenant = await getUserTenant();

  if (!tenant) {
    // テナントがない場合はダッシュボードへ
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">診断</h1>
        <p className="text-[13px] text-muted-foreground">
          会社属性や要件を入力して、最適なSaaSを診断します
        </p>
      </div>

      <DiagnosisForm tenantId={tenant.id} />
    </div>
  );
}
