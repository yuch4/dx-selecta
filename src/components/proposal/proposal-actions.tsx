"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Copy, RefreshCw, ArrowLeft, Check, Pencil, Eye } from "lucide-react";
import { useState } from "react";

interface ProposalActionsProps {
  sessionId: string;
  runId: string;
  markdownText: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
  isEditMode?: boolean;
  onToggleEdit?: () => void;
}

export function ProposalActions({
  sessionId,
  runId,
  markdownText,
  onRegenerate,
  isRegenerating,
  isEditMode = false,
  onToggleEdit,
}: ProposalActionsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };
  
  const handleBackToCompare = () => {
    router.push(`/dashboard/compare?sessionId=${sessionId}&runId=${runId}`);
  };
  
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={handleBackToCompare}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        比較に戻る
      </Button>
      
      <div className="flex items-center gap-3">
        {/* 編集/プレビュー切替 */}
        {onToggleEdit && (
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={onToggleEdit}
          >
            {isEditMode ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                プレビュー
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                編集
              </>
            )}
          </Button>
        )}
        
        <Button
          variant="outline"
          onClick={handleCopy}
          disabled={!markdownText}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              コピー完了
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              コピー
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={isRegenerating || isEditMode}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
          再生成
        </Button>
      </div>
    </div>
  );
}
