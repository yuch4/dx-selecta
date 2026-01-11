"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { DiagnosisFormData, DiagnosisConstraints, DataResidency } from "@/types/diagnosis";

interface StepConstraintsProps {
  data: DiagnosisFormData;
  onUpdate: (data: Partial<DiagnosisFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepConstraints({ data, onUpdate, onNext, onBack }: StepConstraintsProps) {
  const updateConstraint = <K extends keyof DiagnosisConstraints>(
    key: K,
    value: DiagnosisConstraints[K]
  ) => {
    onUpdate({
      constraints: {
        ...data.constraints,
        [key]: value,
      },
    });
  };

  const toggleLanguage = (lang: string) => {
    const langs = data.constraints.requiredLanguages;
    const newLangs = langs.includes(lang)
      ? langs.filter((l) => l !== lang)
      : [...langs, lang];
    updateConstraint("requiredLanguages", newLangs);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Must条件</h2>
        <p className="text-sm text-muted-foreground">
          譲れない条件を設定してください
        </p>
      </div>

      <div className="space-y-4">
        {/* 予算 */}
        <div className="space-y-2">
          <Label htmlFor="budget">月額予算上限（円）</Label>
          <Input
            id="budget"
            type="number"
            placeholder="例: 50000"
            value={data.constraints.budgetMax || ""}
            onChange={(e) =>
              updateConstraint(
                "budgetMax",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
          />
        </div>

        {/* 導入期限 */}
        <div className="space-y-2">
          <Label htmlFor="deadline">導入期限</Label>
          <Input
            id="deadline"
            type="date"
            value={data.constraints.deployDeadline || ""}
            onChange={(e) =>
              updateConstraint("deployDeadline", e.target.value || null)
            }
          />
        </div>

        {/* 対応言語 */}
        <div className="space-y-2">
          <Label>必要な対応言語</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lang-ja"
                checked={data.constraints.requiredLanguages.includes("ja")}
                onCheckedChange={() => toggleLanguage("ja")}
              />
              <Label htmlFor="lang-ja" className="cursor-pointer">
                日本語
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lang-en"
                checked={data.constraints.requiredLanguages.includes("en")}
                onCheckedChange={() => toggleLanguage("en")}
              />
              <Label htmlFor="lang-en" className="cursor-pointer">
                英語
              </Label>
            </div>
          </div>
        </div>

        {/* SSO */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sso"
            checked={data.constraints.requireSso}
            onCheckedChange={(checked) =>
              updateConstraint("requireSso", !!checked)
            }
          />
          <Label htmlFor="sso" className="cursor-pointer">
            SSO（シングルサインオン）必須
          </Label>
        </div>

        {/* 監査ログ */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auditLog"
            checked={data.constraints.requireAuditLog}
            onCheckedChange={(checked) =>
              updateConstraint("requireAuditLog", !!checked)
            }
          />
          <Label htmlFor="auditLog" className="cursor-pointer">
            監査ログ必須
          </Label>
        </div>

        {/* データ保管地域 */}
        <div className="space-y-2">
          <Label htmlFor="dataResidency">データ保管地域</Label>
          <Select
            value={data.constraints.dataResidency || "any"}
            onValueChange={(value) =>
              updateConstraint(
                "dataResidency",
                value === "any" ? null : (value as DataResidency)
              )
            }
          >
            <SelectTrigger id="dataResidency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">指定なし</SelectItem>
              <SelectItem value="japan">日本国内のみ</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
