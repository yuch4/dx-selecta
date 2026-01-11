"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface DownloadMenuProps {
  onDownloadPdf: () => Promise<void>;
  disabled?: boolean;
}

export function DownloadMenu({ onDownloadPdf, disabled }: DownloadMenuProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await onDownloadPdf();
      toast.success("PDFをダウンロードしました");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("PDFのダウンロードに失敗しました", {
        description: error instanceof Error ? error.message : "エラーが発生しました",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isDownloading}>
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          ダウンロード
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadPdf} disabled={isDownloading}>
          <FileText className="mr-2 h-4 w-4" />
          PDF形式
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="text-muted-foreground">
          <FileText className="mr-2 h-4 w-4" />
          PPTX形式（準備中）
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
