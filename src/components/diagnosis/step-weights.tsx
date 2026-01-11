"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { DiagnosisFormData, DiagnosisWeights } from "@/types/diagnosis";

interface StepWeightsProps {
  data: DiagnosisFormData;
  onUpdate: (data: Partial<DiagnosisFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const WEIGHT_LABELS: Record<keyof DiagnosisWeights, { label: string; description: string }> = {
  operationEase: {
    label: "運用のしやすさ",
    description: "日常的な運用負荷の軽さ",
  },
  deploymentEase: {
    label: "導入のしやすさ",
    description: "初期セットアップの簡単さ",
  },
  integrations: {
    label: "連携性",
    description: "他システムとの連携の豊富さ",
  },
  security: {
    label: "セキュリティ",
    description: "セキュリティ機能の充実度",
  },
  price: {
    label: "価格の手頃さ",
    description: "コストパフォーマンス",
  },
};

export function StepWeights({ data, onUpdate, onNext, onBack }: StepWeightsProps) {
  const updateWeight = (key: keyof DiagnosisWeights, value: number) => {
    onUpdate({
      weights: {
        ...data.weights,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">重み付け</h2>
        <p className="text-sm text-muted-foreground">
          各評価軸の重要度を調整してください（0〜10）
        </p>
      </div>

      <div className="space-y-6">
        {(Object.entries(WEIGHT_LABELS) as [keyof DiagnosisWeights, { label: string; description: string }][]).map(
          ([key, { label, description }]) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{label}</Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <span className="w-8 text-right font-medium">
                  {data.weights[key]}
                </span>
              </div>
              <Slider
                value={[data.weights[key]]}
                onValueChange={([value]) => updateWeight(key, value)}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          )
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          戻る
        </Button>
        <Button onClick={onNext}>次へ</Button>
      </div>
    </div>
  );
}
