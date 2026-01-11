"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CATEGORY_LABELS,
  COMPANY_SIZE_LABELS,
  type DiagnosisFormData,
} from "@/types/diagnosis";
import { Loader2 } from "lucide-react";

interface StepConfirmProps {
  data: DiagnosisFormData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepConfirm({ data, onBack, onSubmit, isSubmitting }: StepConfirmProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">入力内容の確認</h2>
        <p className="text-sm text-muted-foreground">
          以下の内容で診断を開始します
        </p>
      </div>

      <div className="space-y-4">
        {/* 会社属性 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">会社属性</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">業種:</span>{" "}
              {data.companyIndustry}
            </p>
            <p>
              <span className="text-muted-foreground">規模:</span>{" "}
              {COMPANY_SIZE_LABELS[data.companySize]}
            </p>
            <p>
              <span className="text-muted-foreground">地域:</span>{" "}
              {data.companyRegion}
            </p>
          </CardContent>
        </Card>

        {/* カテゴリ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">対象カテゴリ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {CATEGORY_LABELS[data.category]}
          </CardContent>
        </Card>

        {/* 課題 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">課題・ニーズ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {data.problems.length > 0 ? (
              <ul className="list-disc pl-4 space-y-1">
                {data.problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">選択なし</p>
            )}
            {data.problemFreeText && (
              <p className="mt-2 text-muted-foreground">
                その他: {data.problemFreeText}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Must条件 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Must条件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {data.constraints.budgetMax && (
              <p>
                <span className="text-muted-foreground">月額予算上限:</span>{" "}
                ¥{data.constraints.budgetMax.toLocaleString()}
              </p>
            )}
            {data.constraints.deployDeadline && (
              <p>
                <span className="text-muted-foreground">導入期限:</span>{" "}
                {data.constraints.deployDeadline}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">対応言語:</span>{" "}
              {data.constraints.requiredLanguages
                .map((l) => (l === "ja" ? "日本語" : "英語"))
                .join(", ")}
            </p>
            {data.constraints.requireSso && <p>✓ SSO必須</p>}
            {data.constraints.requireAuditLog && <p>✓ 監査ログ必須</p>}
            {data.constraints.dataResidency === "japan" && (
              <p>✓ データ保管: 日本国内のみ</p>
            )}
          </CardContent>
        </Card>

        {/* 重み付け */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">重み付け</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">運用のしやすさ:</span>{" "}
              {data.weights.operationEase}/10
            </p>
            <p>
              <span className="text-muted-foreground">導入のしやすさ:</span>{" "}
              {data.weights.deploymentEase}/10
            </p>
            <p>
              <span className="text-muted-foreground">連携性:</span>{" "}
              {data.weights.integrations}/10
            </p>
            <p>
              <span className="text-muted-foreground">セキュリティ:</span>{" "}
              {data.weights.security}/10
            </p>
            <p>
              <span className="text-muted-foreground">価格の手頃さ:</span>{" "}
              {data.weights.price}/10
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          戻る
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "診断を開始"
          )}
        </Button>
      </div>
    </div>
  );
}
