"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ProposalView } from "@/components/proposal/proposal-view";
import { ProposalEditor } from "@/components/proposal/proposal-editor";
import { ProposalActions } from "@/components/proposal/proposal-actions";
import { generateProposal, getProposal, getProposalById, updateProposal } from "../actions";
import { generateProposalPdf, downloadPdf, generateFilename } from "@/lib/export/pdf-generator";
import type { ProposalOutput } from "@/types/proposal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProposalContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const runId = searchParams.get("runId");
  const solutionId = searchParams.get("solutionId");
  const proposalId = searchParams.get("id"); // 履歴から直接アクセス用
  
  const [proposal, setProposal] = useState<ProposalOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 稟議書生成/取得
  const loadProposal = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ID指定での表示（履歴からのアクセス）
      if (proposalId) {
        const existingProposal = await getProposalById(proposalId);
        if (existingProposal) {
          setProposal(existingProposal);
        } else {
          setError("稟議書が見つかりません");
        }
        return;
      }
      
      // runId/solutionIdでの表示（通常フロー）
      if (!runId || !solutionId) {
        setError("パラメータが不足しています。診断から始めてください。");
        setIsLoading(false);
        return;
      }
      
      // 既存の稟議書を確認
      let existingProposal = await getProposal(runId, solutionId);
      
      // なければ生成
      if (!existingProposal) {
        existingProposal = await generateProposal(runId, solutionId);
      }
      
      setProposal(existingProposal);
    } catch (err) {
      console.error("Proposal load error:", err);
      setError(err instanceof Error ? err.message : "稟議書の読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [proposalId, runId, solutionId]);
  
  useEffect(() => {
    loadProposal();
  }, [loadProposal]);
  
  // 再生成
  const handleRegenerate = async () => {
    if (!runId || !solutionId) return;
    
    setIsRegenerating(true);
    try {
      const newProposal = await generateProposal(runId, solutionId);
      setProposal(newProposal);
      setIsEditMode(false); // 再生成後は表示モードに戻す
    } catch (err) {
      console.error("Regenerate error:", err);
      setError(err instanceof Error ? err.message : "再生成に失敗しました");
    } finally {
      setIsRegenerating(false);
    }
  };
  
  // 編集後の保存
  const handleSave = async (markdownText: string): Promise<ProposalOutput> => {
    const updated = await updateProposal(proposal!.id, markdownText);
    setProposal(updated);
    setIsEditMode(false);
    return updated;
  };
  
  // 編集モード切替
  const handleToggleEdit = () => {
    setIsEditMode((prev) => !prev);
  };
  
  // PDFダウンロード
  const handleDownloadPdf = async () => {
    if (!proposal) return;
    
    try {
      // マークダウンからソリューション名を抽出（最初の#で始まるタイトル行を使用）
      const titleMatch = proposal.markdown_text?.match(/^#\s+(.+?)\s*導入稟議書/m);
      const solutionName = titleMatch ? titleMatch[1] : "ソリューション";
      
      const metadata = {
        title: `稟議書 - ${solutionName}導入提案`,
        author: "DX Selecta",
        subject: "ソリューション導入稟議書",
        creator: "DX Selecta - SaaS選定支援システム",
        generatedAt: proposal.generated_at,
        version: proposal.version,
        solutionName,
      };
      
      console.log("Starting PDF generation...");
      const pdfBlob = await generateProposalPdf(proposal.markdown_text || "", metadata);
      console.log("PDF generated, blob size:", pdfBlob.size);
      const filename = generateFilename(solutionName, "pdf");
      downloadPdf(pdfBlob, filename);
      console.log("PDF downloaded:", filename);
      toast.success("PDFをダウンロードしました");
    } catch (err) {
      console.error("PDF generation error:", err);
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      toast.error("PDFの生成に失敗しました");
    }
  };
  
  // ローディング中
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">稟議書を生成中...</p>
      </div>
    );
  }
  
  // エラー時
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          <a href={sessionId ? `/search?sessionId=${sessionId}` : "/diagnosis"} className="underline hover:text-primary">
            検索結果に戻る
          </a>
        </p>
      </div>
    );
  }
  
  if (!proposal) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* バージョン情報 */}
      <div className="text-sm text-muted-foreground">
        バージョン {proposal.version} | 生成日時: {new Date(proposal.generated_at).toLocaleString("ja-JP")}
      </div>
      
      {/* 稟議書表示 or 編集 */}
      {isEditMode ? (
        <ProposalEditor proposal={proposal} onSave={handleSave} />
      ) : (
        <ProposalView proposal={proposal} />
      )}
      
      {/* アクション */}
      {sessionId && runId && (
        <ProposalActions
          sessionId={sessionId}
          runId={runId}
          markdownText={proposal.markdown_text || ""}
          onRegenerate={handleRegenerate}
          isRegenerating={isRegenerating}
          isEditMode={isEditMode}
          onToggleEdit={handleToggleEdit}
          onDownloadPdf={handleDownloadPdf}
        />
      )}
    </div>
  );
}
