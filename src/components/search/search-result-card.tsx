"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
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
  
  // スコアレベル
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { color: "text-primary", bg: "bg-primary/10", label: "高" };
    if (score >= 60) return { color: "text-warning", bg: "bg-warning/10", label: "中" };
    return { color: "text-muted-foreground", bg: "bg-muted", label: "低" };
  };
  
  const scoreLevel = getScoreLevel(score);
  
  // ランクバッジ
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: "🥇", variant: "default" as const };
    if (rank === 2) return { emoji: "🥈", variant: "secondary" as const };
    if (rank === 3) return { emoji: "🥉", variant: "secondary" as const };
    return { emoji: "", variant: "outline" as const };
  };
  
  const rankBadge = getRankBadge(rank);
  
  return (
    <Card className={`group border-border/50 transition-all duration-200 ${
      isSelected 
        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" 
        : "hover:border-border hover:shadow-sm"
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="pt-0.5">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(solution.id)}
              className="h-4 w-4"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Top row: Badges */}
            <div className="flex items-center gap-2">
              <Badge variant={rankBadge.variant} className="h-5 gap-1 px-1.5 text-[10px] font-medium">
                {rankBadge.emoji} {rank}位
              </Badge>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground">
                {categoryLabels[solution.category] || solution.category}
              </Badge>
            </div>
            
            {/* Title & Vendor */}
            <div>
              <h3 className="text-[15px] font-semibold leading-tight">{solution.name}</h3>
              <p className="text-[12px] text-muted-foreground">{solution.vendor}</p>
            </div>
          </div>
          
          {/* Score */}
          <div className={`flex flex-col items-center rounded-lg px-3 py-2 ${scoreLevel.bg}`}>
            <div className="flex items-baseline gap-0.5">
              <span className={`font-data text-xl font-semibold ${scoreLevel.color}`}>
                {score.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-3 w-3 ${scoreLevel.color}`} />
              <span className={`text-[10px] font-medium ${scoreLevel.color}`}>
                {scoreLevel.label}マッチ
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {/* Description */}
        {solution.description && (
          <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
            {solution.description}
          </p>
        )}
        
        {/* Recommendation reason */}
        {explain && (
          <div className="space-y-2 rounded-lg bg-muted/30 p-3">
            <p className="text-[12px] font-medium text-muted-foreground">推薦理由</p>
            <p className="text-[13px] text-foreground">{explain.summary}</p>
            
            {/* Matched facts */}
            {explain.matchedFacts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {explain.matchedFacts.map((fact, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5"
                  >
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    <span className="text-[11px] text-primary">{fact.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Concerns */}
        {result.concerns && result.concerns.length > 0 && (
          <div className="space-y-1.5 rounded-lg border border-warning/20 bg-warning/5 p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-medium text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              要確認事項
            </p>
            {result.concerns.map((concern, index) => (
              <p key={index} className="text-[12px] text-muted-foreground pl-5">
                • {concern}
              </p>
            ))}
          </div>
        )}
        
        {/* Actions */}
        {solution.website_url && (
          <div className="flex items-center justify-end pt-1">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="h-7 gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
            >
              <a href={solution.website_url} target="_blank" rel="noopener noreferrer">
                公式サイト
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
