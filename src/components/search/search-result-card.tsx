"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, CheckCircle2, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
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
    if (score >= 80) return { color: "text-emerald-600", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50", label: "高マッチ", border: "border-emerald-200" };
    if (score >= 60) return { color: "text-amber-600", bg: "bg-gradient-to-br from-amber-50 to-amber-100/50", label: "中マッチ", border: "border-amber-200" };
    return { color: "text-muted-foreground", bg: "bg-muted/50", label: "低マッチ", border: "border-border" };
  };
  
  const scoreLevel = getScoreLevel(score);
  
  // ランクバッジ
  const getRankStyle = (rank: number) => {
    if (rank === 1) return { gradient: "from-amber-400 to-amber-500", text: "text-amber-900", icon: "🥇" };
    if (rank === 2) return { gradient: "from-slate-300 to-slate-400", text: "text-slate-700", icon: "🥈" };
    if (rank === 3) return { gradient: "from-orange-300 to-orange-400", text: "text-orange-800", icon: "🥉" };
    return { gradient: "from-muted to-muted", text: "text-muted-foreground", icon: "" };
  };
  
  const rankStyle = getRankStyle(rank);
  
  return (
    <Card className={`group relative overflow-hidden border-border/40 transition-all duration-300 ${
      isSelected 
        ? "border-primary/40 bg-primary/[0.02] ring-1 ring-primary/20 shadow-lg shadow-primary/5" 
        : "bg-card hover:border-border/60 hover:shadow-md"
    }`}>
      {/* Top gradient accent for top 3 */}
      {rank <= 3 && (
        <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${rankStyle.gradient}`} />
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(solution.id)}
              className="h-5 w-5 rounded-md border-2 transition-all data-[state=checked]:border-primary data-[state=checked]:bg-primary"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Top row: Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {rank <= 3 && (
                <div className={`flex h-6 items-center gap-1 rounded-md bg-gradient-to-r ${rankStyle.gradient} px-2`}>
                  <span className="text-xs">{rankStyle.icon}</span>
                  <span className={`text-[11px] font-bold ${rankStyle.text}`}>{rank}位</span>
                </div>
              )}
              {rank > 3 && (
                <Badge variant="outline" className="h-6 border-border/60 px-2 text-[11px] font-medium text-muted-foreground">
                  {rank}位
                </Badge>
              )}
              <Badge variant="secondary" className="h-6 px-2 text-[11px] font-medium">
                {categoryLabels[solution.category] || solution.category}
              </Badge>
            </div>
            
            {/* Title & Vendor */}
            <div>
              <h3 className="text-[16px] font-semibold tracking-tight leading-tight">{solution.name}</h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{solution.vendor}</p>
            </div>
          </div>
          
          {/* Score */}
          <div className={`flex flex-col items-center rounded-xl border px-4 py-3 ${scoreLevel.bg} ${scoreLevel.border}`}>
            <div className="flex items-baseline gap-0.5">
              <span className={`font-data text-2xl font-bold ${scoreLevel.color}`}>
                {score.toFixed(0)}
              </span>
              <span className={`text-[10px] font-medium ${scoreLevel.color}`}>pt</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <TrendingUp className={`h-3 w-3 ${scoreLevel.color}`} />
              <span className={`text-[10px] font-semibold ${scoreLevel.color}`}>
                {scoreLevel.label}
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
          <div className="space-y-3 rounded-xl border border-border/40 bg-gradient-to-br from-muted/30 to-accent/20 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <p className="text-[12px] font-semibold text-foreground/80">推薦理由</p>
            </div>
            <p className="text-[13px] leading-relaxed text-foreground">{explain.summary}</p>
            
            {/* Matched facts */}
            {explain.matchedFacts.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {explain.matchedFacts.map((fact, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 transition-colors hover:bg-emerald-500/15"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span className="text-[11px] font-medium text-emerald-700">{fact.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Concerns */}
        {result.concerns && result.concerns.length > 0 && (
          <div className="space-y-2 rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/30 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <p className="text-[12px] font-semibold text-amber-800">要確認事項</p>
            </div>
            <ul className="space-y-1">
              {result.concerns.map((concern, index) => (
                <li key={index} className="flex items-start gap-2 text-[12px] text-amber-800/80">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Actions */}
        {solution.website_url && (
          <div className="flex items-center justify-end border-t border-border/30 pt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="h-8 gap-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <a href={solution.website_url} target="_blank" rel="noopener noreferrer">
                公式サイトを見る
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
