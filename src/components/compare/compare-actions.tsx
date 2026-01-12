"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Download, FileText, ArrowLeft } from "lucide-react";

interface CompareActionsProps {
  sessionId: string;
  runId: string;
  primarySolutionId: string | null;
  onExportCsv: () => void;
  isExporting: boolean;
}

export function CompareActions({
  sessionId,
  runId,
  primarySolutionId,
  onExportCsv,
  isExporting,
}: CompareActionsProps) {
  const router = useRouter();
  
  const handleGenerateProposal = () => {
    if (!primarySolutionId) return;
    
    const params = new URLSearchParams();
    params.set("sessionId", sessionId);
    params.set("runId", runId);
    params.set("solutionId", primarySolutionId);
    router.push(`/dashboard/proposal?${params.toString()}`);
  };
  
  const handleBackToSearch = () => {
    router.push(`/dashboard/search?sessionId=${sessionId}`);
  };
  
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={handleBackToSearch}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        検索結果に戻る
      </Button>
      
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onExportCsv}
          disabled={isExporting}
        >
          <Download className="mr-2 h-4 w-4" />
          CSVダウンロード
        </Button>
        
        <Button
          onClick={handleGenerateProposal}
          disabled={!primarySolutionId}
        >
          <FileText className="mr-2 h-4 w-4" />
          稟議書を生成
        </Button>
      </div>
    </div>
  );
}
