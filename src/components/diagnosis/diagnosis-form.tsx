"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { StepCompanyInfo } from "./step-company-info";
import { StepCategory } from "./step-category";
import { StepProblems } from "./step-problems";
import { StepConstraints } from "./step-constraints";
import { StepWeights } from "./step-weights";
import { StepConfirm } from "./step-confirm";
import { createSession, saveInput, completeSession } from "@/app/(dashboard)/diagnosis/actions";
import { DEFAULT_FORM_DATA, type DiagnosisFormData } from "@/types/diagnosis";

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
}

export function DiagnosisForm({ tenantId }: DiagnosisFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DiagnosisFormData>(DEFAULT_FORM_DATA);
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
      // セッション作成
      const session = await createSession(tenantId);

      // 入力保存
      await saveInput(session.id, formData);

      // セッション完了（検索ページへリダイレクト）
      await completeSession(session.id);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* プログレスバー */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            ステップ {currentStep} / {STEPS.length}
          </span>
          <span className="font-medium">{STEPS[currentStep - 1].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* ステップインジケーター */}
      <div className="flex justify-center gap-2">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`h-2 w-2 rounded-full transition-colors ${
              step.id === currentStep
                ? "bg-primary"
                : step.id < currentStep
                ? "bg-primary/50"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* フォーム本体 */}
      <Card>
        <CardContent className="pt-6">
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
