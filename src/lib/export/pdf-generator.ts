/**
 * PDF生成ユーティリティ
 * 
 * Markdownの稟議書をPDF形式に変換する
 */

import { pdf } from "@react-pdf/renderer";
import { ProposalPdfDocument } from "@/components/proposal/proposal-pdf";
import { parseMarkdownToSections } from "@/lib/proposal/parser";

// PDFメタデータ
export interface PdfMetadata {
  title: string;
  solutionName?: string;
  solutionVendor?: string;
  generatedAt: string;
  version: number;
}

/**
 * Markdown稟議書をPDFに変換
 * 
 * @param markdown - Markdownテキスト
 * @param metadata - PDFメタデータ
 * @returns PDF Blob
 */
export async function generateProposalPdf(
  markdown: string,
  metadata: PdfMetadata
): Promise<Blob> {
  // Markdownをセクションに分割
  const sections = parseMarkdownToSections(markdown);
  
  // PDFドキュメントを生成
  const document = ProposalPdfDocument({ sections, metadata });
  
  // BlobとしてPDFを生成
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(document as any).toBlob();
  
  return blob;
}

/**
 * PDFをダウンロード
 * 
 * @param blob - PDF Blob
 * @param filename - ファイル名
 */
export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * ファイル名を生成
 * 
 * @param solutionName - 製品名
 * @param type - ファイルタイプ
 * @returns ファイル名
 */
export function generateFilename(
  solutionName: string,
  type: "pdf" | "pptx"
): string {
  const date = new Date().toISOString().split("T")[0];
  const safeName = solutionName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, "_");
  return `稟議書_${safeName}_${date}.${type}`;
}
