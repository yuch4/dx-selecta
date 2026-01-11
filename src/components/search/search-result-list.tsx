"use client";

import { SearchResultCard } from "./search-result-card";
import type { SearchResultWithSolution } from "@/types/search";

interface SearchResultListProps {
  results: SearchResultWithSolution[];
  selectedIds: string[];
  onToggleSelect: (solutionId: string) => void;
}

export function SearchResultList({ results, selectedIds, onToggleSelect }: SearchResultListProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          条件に一致する製品が見つかりませんでした
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          必須条件を緩和して再度お試しください
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          推薦結果 <span className="text-muted-foreground font-normal">（Top {results.length}）</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          {selectedIds.length}件選択中
        </p>
      </div>
      
      <div className="space-y-4">
        {results.map((result) => (
          <SearchResultCard
            key={result.id}
            result={result}
            isSelected={selectedIds.includes(result.solution_id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  );
}
