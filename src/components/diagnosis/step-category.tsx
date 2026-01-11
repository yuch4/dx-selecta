"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  type DiagnosisFormData,
  type Category,
} from "@/types/diagnosis";

interface StepCategoryProps {
  data: DiagnosisFormData;
  onUpdate: (data: Partial<DiagnosisFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCategory({ data, onUpdate, onNext, onBack }: StepCategoryProps) {
  const isValid = !!data.category;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">対象カテゴリ</h2>
        <p className="text-sm text-muted-foreground">
          検討しているSaaSのカテゴリを選択してください
        </p>
      </div>

      <RadioGroup
        value={data.category}
        onValueChange={(value) => onUpdate({ category: value as Category })}
        className="grid gap-3 sm:grid-cols-2"
      >
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroupItem value={value} id={value} />
            <Label
              htmlFor={value}
              className="flex-1 cursor-pointer rounded-lg border p-4 hover:bg-muted/50"
            >
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          戻る
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          次へ
        </Button>
      </div>
    </div>
  );
}
