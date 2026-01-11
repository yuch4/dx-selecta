"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";
import type { ProposalOutput } from "@/types/proposal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProposalViewProps {
  proposal: ProposalOutput;
}

export function ProposalView({ proposal }: ProposalViewProps) {
  if (!proposal.markdown_text) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-[13px] text-muted-foreground">稟議書の内容がありません</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-border/50">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold">稟議書</h2>
              <p className="text-[12px] text-muted-foreground">自動生成されたドキュメント</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-6 gap-1.5 px-2 text-[11px]">
              <Clock className="h-3 w-3" />
              v{proposal.version || 1}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <article className="prose prose-sm max-w-none dark:prose-invert 
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-h1:text-xl prose-h1:border-b prose-h1:border-border/50 prose-h1:pb-3 prose-h1:mb-4
          prose-h2:text-lg prose-h2:text-foreground prose-h2:mt-6 prose-h2:mb-3
          prose-h3:text-[15px] prose-h3:text-foreground
          prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-muted-foreground
          prose-li:text-[13px] prose-li:text-muted-foreground prose-li:marker:text-muted-foreground/50
          prose-table:text-[12px] prose-th:bg-muted/50 prose-th:font-medium prose-th:text-muted-foreground
          prose-td:border-border/50 prose-th:border-border/50
          prose-strong:text-foreground prose-strong:font-semibold
          prose-code:text-[12px] prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {proposal.markdown_text}
          </ReactMarkdown>
        </article>
      </CardContent>
    </Card>
  );
}
