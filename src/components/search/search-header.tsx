"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InputSnapshot } from "@/types/search";

// カテゴリ表示名
const categoryLabels: Record<string, string> = {
  accounting: "会計",
  expense: "経費精算",
  attendance: "勤怠管理",
  hr: "人事労務",
  workflow: "ワークフロー",
  e_contract: "電子契約",
  invoice: "請求書",
  procurement: "調達",
};

interface SearchHeaderProps {
  inputSnapshot: InputSnapshot;
  totalCandidates: number;
  durationMs: number | null;
}

export function SearchHeader({ inputSnapshot, totalCandidates, durationMs }: SearchHeaderProps) {
  const constraints = inputSnapshot.constraints;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">診断条件</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* カテゴリ・会社情報 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-sm">
              {categoryLabels[inputSnapshot.category] || inputSnapshot.category}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {inputSnapshot.company_industry}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {inputSnapshot.company_size}名規模
            </Badge>
          </div>
          
          {/* 必須条件 */}
          {(constraints.requireSso || constraints.requireAuditLog) && (
            <div className="flex flex-wrap gap-2">
              {constraints.requireSso && (
                <Badge variant="secondary" className="text-xs">
                  SSO必須
                </Badge>
              )}
              {constraints.requireAuditLog && (
                <Badge variant="secondary" className="text-xs">
                  監査ログ必須
                </Badge>
              )}
              {constraints.budgetMax && (
                <Badge variant="secondary" className="text-xs">
                  予算上限: ¥{constraints.budgetMax.toLocaleString()}/月
                </Badge>
              )}
            </div>
          )}
          
          {/* 検索結果サマリ */}
          <div className="text-sm text-muted-foreground">
            {totalCandidates}件の候補から検索
            {durationMs && <span className="ml-2">（{durationMs}ms）</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
