"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";

interface CompareActionBarProps {
  selectedIds: string[];
  sessionId: string;
  runId: string | null;
  onRerun: () => void;
  isLoading: boolean;
}

export function CompareActionBar({ selectedIds, sessionId, runId, onRerun, isLoading }: CompareActionBarProps) {
  const router = useRouter();
  
  const handleCompare = () => {
    if (selectedIds.length < 2 || !runId) return;
    
    // 比較ページへ遷移（選択したIDをクエリパラメータで渡す）
    const params = new URLSearchParams();
    params.set("sessionId", sessionId);
    params.set("runId", runId);
    selectedIds.forEach((id) => params.append("solutions", id));
    router.push(`/dashboard/compare?${params.toString()}`);
  };
  
  return (
    <div className="sticky bottom-0 bg-background border-t p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={onRerun}
          disabled={isLoading}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          再検索
        </Button>
        
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {selectedIds.length}件選択中
            {selectedIds.length > 0 && selectedIds.length < 2 && (
              <span className="text-amber-600 ml-2">（2件以上選択してください）</span>
            )}
          </p>
          
          <Button
            onClick={handleCompare}
            disabled={selectedIds.length < 2}
          >
            比較する
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
