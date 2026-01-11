"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import type { SearchResultWithSolution } from "@/types/search";

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

interface SearchResultCardProps {
  result: SearchResultWithSolution;
  isSelected: boolean;
  onToggleSelect: (solutionId: string) => void;
}

export function SearchResultCard({ result, isSelected, onToggleSelect }: SearchResultCardProps) {
  const { solution, score, explain, rank } = result;
  
  // スコアに基づく色
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-gray-600";
  };
  
  return (
    <Card className={`transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* 選択チェックボックス */}
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(solution.id)}
              className="mt-1"
            />
            
            <div>
              {/* 順位バッジ */}
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={rank === 1 ? "default" : "outline"} className="text-xs">
                  {rank}位
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[solution.category] || solution.category}
                </Badge>
              </div>
              
              <CardTitle className="text-lg">{solution.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{solution.vendor}</p>
            </div>
          </div>
          
          {/* スコア表示 */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">スコア</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 製品説明 */}
        {solution.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {solution.description}
          </p>
        )}
        
        {/* 推薦理由 */}
        {explain && (
          <div className="space-y-2">
            <p className="text-sm font-medium">推薦理由</p>
            <p className="text-sm text-muted-foreground">{explain.summary}</p>
            
            {/* マッチしたファクト */}
            {explain.matchedFacts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {explain.matchedFacts.map((fact, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {fact.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 懸念点 */}
        {result.concerns && result.concerns.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-600">要確認事項</p>
            {result.concerns.map((concern, index) => (
              <div key={index} className="flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="h-3 w-3" />
                {concern}
              </div>
            ))}
          </div>
        )}
        
        {/* アクション */}
        {solution.website_url && (
          <div className="pt-2">
            <Button variant="outline" size="sm" asChild>
              <a href={solution.website_url} target="_blank" rel="noopener noreferrer">
                公式サイト
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
