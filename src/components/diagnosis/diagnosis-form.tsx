"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StepCompanyInfo } from "./step-company-info";
import { StepCategory } from "./step-category";
import { StepProblems } from "./step-problems";
import { StepConstraints } from "./step-constraints";
import { StepWeights } from "./step-weights";
import { StepConfirm } from "./step-confirm";
import { createSession, saveInput, completeSession } from "@/app/dashboard/diagnosis/actions";
import { DEFAULT_FORM_DATA, type DiagnosisFormData } from "@/types/diagnosis";
import { PlayCircle } from "lucide-react";

const STEPS = [
  { id: 1, title: "会社属性" },
  { id: 2, title: "カテゴリ" },
  { id: 3, title: "課題" },
  { id: 4, title: "Must条件" },
  { id: 5, title: "重み付け" },
  { id: 6, title: "確認" },
];

interface DiagnosisFormProps {
  tenantId: string;
  existingSessionId?: string;
  initialFormData?: DiagnosisFormData;
}

export function DiagnosisForm({ tenantId, existingSessionId, initialFormData }: DiagnosisFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DiagnosisFormData>(initialFormData || DEFAULT_FORM_DATA);
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = (currentStep / STEPS.length) * 100;

  const updateFormData = (data: Partial<DiagnosisFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 既存セッションがあればそれを使用、なければ新規作成
      let currentSessionId: string = sessionId || "";
      if (!currentSessionId) {
        const session = await createSession(tenantId);
        currentSessionId = session.id;
        setSessionId(currentSessionId);
      }

      // 入力保存
      await saveInput(currentSessionId, formData);

      // セッション完了（検索ページへリダイレクト）
      await completeSession(currentSessionId);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Resume indicator */}
      {existingSessionId && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-950">
          <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[13px] text-blue-700 dark:text-blue-300">
            保存された診断を再開しています
          </span>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            下書き
          </Badge>
        </div>
      )}

      {/* Progress Header */}
      <div className="space-y-4">
        {/* Step indicator with labels */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-data text-[11px] uppercase tracking-wide text-muted-foreground">
              STEP {currentStep} OF {STEPS.length}
            </p>
            <h2 className="text-lg font-semibold tracking-tight">{STEPS[currentStep - 1].title}</h2>
          </div>
          <div className="text-right">
            <span className="font-data text-2xl font-semibold text-primary">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <Progress value={progress} className="h-1.5" />
        
        {/* Step dots */}
        <div className="flex justify-center gap-2 pt-1">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                step.id === currentStep
                  ? "w-4 bg-primary"
                  : step.id < currentStep
                  ? "bg-primary/60"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-[13px] text-destructive">{error}</p>
        </div>
      )}

      {/* Form body */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <StepCompanyInfo
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <StepCategory
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepProblems
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <StepConstraints
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <StepWeights
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 6 && (
            <StepConfirm
              data={formData}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
