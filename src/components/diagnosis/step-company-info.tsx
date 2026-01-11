"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  INDUSTRIES,
  REGIONS,
  COMPANY_SIZE_LABELS,
  type DiagnosisFormData,
  type CompanySize,
} from "@/types/diagnosis";

interface StepCompanyInfoProps {
  data: DiagnosisFormData;
  onUpdate: (data: Partial<DiagnosisFormData>) => void;
  onNext: () => void;
}

export function StepCompanyInfo({ data, onUpdate, onNext }: StepCompanyInfoProps) {
  const isValid = data.companyIndustry && data.companySize && data.companyRegion;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">会社属性</h2>
        <p className="text-sm text-muted-foreground">
          貴社の基本情報を入力してください
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="industry">業種</Label>
          <Select
            value={data.companyIndustry}
            onValueChange={(value) => onUpdate({ companyIndustry: value })}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="業種を選択" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">従業員規模</Label>
          <Select
            value={data.companySize}
            onValueChange={(value) => onUpdate({ companySize: value as CompanySize })}
          >
            <SelectTrigger id="size">
              <SelectValue placeholder="規模を選択" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMPANY_SIZE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">地域</Label>
          <Select
            value={data.companyRegion}
            onValueChange={(value) => onUpdate({ companyRegion: value })}
          >
            <SelectTrigger id="region">
              <SelectValue placeholder="地域を選択" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isValid}>
          次へ
        </Button>
      </div>
    </div>
  );
}
