import { DiagnosisForm } from "@/components/diagnosis/diagnosis-form";
import { getUserTenant, getSession } from "./actions";
import { redirect } from "next/navigation";
import type { DiagnosisFormData, DiagnosisConstraints, DiagnosisWeights } from "@/types/diagnosis";

interface Props {
  searchParams: Promise<{ session?: string }>;
}

export default async function DiagnosisPage({ searchParams }: Props) {
  const tenant = await getUserTenant();

  if (!tenant) {
    // テナントがない場合はダッシュボードへ
    redirect("/dashboard");
  }

  // 既存セッションの復元
  const { session: sessionId } = await searchParams;
  let existingSessionId: string | undefined;
  let initialFormData: DiagnosisFormData | undefined;

  if (sessionId) {
    const session = await getSession(sessionId);
    if (session && session.status === "in_progress") {
      existingSessionId = session.id;
      
      // 診断入力があれば復元
      const input = Array.isArray(session.diagnosis_inputs)
        ? session.diagnosis_inputs[0]
        : session.diagnosis_inputs;
      
      if (input) {
        initialFormData = {
          companyIndustry: input.company_industry || "",
          companySize: input.company_size || "51-100",
          companyRegion: input.company_region || "関東",
          category: input.category || "expense",
          problems: input.problems || [],
          problemFreeText: input.problem_free_text || "",
          constraints: (input.constraints as DiagnosisConstraints) || {
            budgetMax: null,
            deployDeadline: null,
            requiredLanguages: ["ja"],
            requireSso: false,
            requireAuditLog: false,
            dataResidency: null,
          },
          weights: (input.weights as DiagnosisWeights) || {
            operationEase: 5,
            deploymentEase: 5,
            integrations: 5,
            security: 5,
            price: 5,
          },
        };
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {existingSessionId ? "診断を再開" : "診断"}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {existingSessionId
            ? "保存された診断を再開します"
            : "会社属性や要件を入力して、最適なSaaSを診断します"}
        </p>
      </div>

      <DiagnosisForm
        tenantId={tenant.id}
        existingSessionId={existingSessionId}
        initialFormData={initialFormData}
      />
    </div>
  );
}
