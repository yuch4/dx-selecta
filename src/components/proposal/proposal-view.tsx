"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ProposalOutput } from "@/types/proposal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProposalViewProps {
  proposal: ProposalOutput;
}

export function ProposalView({ proposal }: ProposalViewProps) {
  if (!proposal.markdown_text) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">稟議書の内容がありません</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="py-6">
        <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-table:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {proposal.markdown_text}
          </ReactMarkdown>
        </article>
      </CardContent>
    </Card>
  );
}
