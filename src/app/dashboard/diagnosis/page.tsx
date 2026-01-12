import { DiagnosisForm } from "@/components/diagnosis/diagnosis-form";
import { getUserTenant, getSession } from "./actions";
import { redirect } from "next/navigation";
import { ClipboardList, Sparkles } from "lucide-react";
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
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-accent/20 p-8">
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-600">
              {existingSessionId ? "セッション復元" : "Step 1"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight-headline sm:text-3xl">
            {existingSessionId ? "診断を再開" : "診断"}
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            {existingSessionId
              ? "保存された診断を再開します。前回の入力内容から続けられます。"
              : "会社属性や要件を入力して、最適なSaaSを診断します。正確な情報を入力するほど、より適切な推薦が得られます。"}
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-2xl" />
        <div className="absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/15 to-transparent blur-2xl" />
        <ClipboardList className="absolute bottom-6 right-8 h-20 w-20 text-violet-500/5" />
      </div>

      <DiagnosisForm
        tenantId={tenant.id}
        existingSessionId={existingSessionId}
        initialFormData={initialFormData}
      />
    </div>
  );
}
