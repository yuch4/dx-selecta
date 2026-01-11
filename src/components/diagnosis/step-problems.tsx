"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { COMMON_PROBLEMS, type DiagnosisFormData } from "@/types/diagnosis";

interface StepProblemsProps {
  data: DiagnosisFormData;
  onUpdate: (data: Partial<DiagnosisFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepProblems({ data, onUpdate, onNext, onBack }: StepProblemsProps) {
  const isValid = data.problems.length > 0 || data.problemFreeText.length > 0;

  const toggleProblem = (problem: string) => {
    const newProblems = data.problems.includes(problem)
      ? data.problems.filter((p) => p !== problem)
      : [...data.problems, problem];
    onUpdate({ problems: newProblems });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">課題・ニーズ</h2>
        <p className="text-sm text-muted-foreground">
          現在抱えている課題を選択してください（複数選択可）
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {COMMON_PROBLEMS.map((problem) => (
          <div key={problem} className="flex items-start space-x-3">
            <Checkbox
              id={problem}
              checked={data.problems.includes(problem)}
              onCheckedChange={() => toggleProblem(problem)}
            />
            <Label
              htmlFor={problem}
              className="cursor-pointer text-sm leading-tight"
            >
              {problem}
            </Label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="freeText">その他の課題（自由記述）</Label>
        <Textarea
          id="freeText"
          placeholder="その他に解決したい課題があれば記入してください..."
          value={data.problemFreeText}
          onChange={(e) => onUpdate({ problemFreeText: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

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
