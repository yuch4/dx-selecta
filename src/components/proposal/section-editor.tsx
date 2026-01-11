"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pencil, Check, X } from "lucide-react";
import type { ProposalSection } from "@/lib/proposal/parser";
import { getSectionDisplayName } from "@/lib/proposal/parser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SectionEditorProps {
  section: ProposalSection;
  onUpdate: (content: string) => void;
  onToggleEdit: () => void;
}

export function SectionEditor({ section, onUpdate, onToggleEdit }: SectionEditorProps) {
  const [editContent, setEditContent] = useState(section.content);
  const [hasChanges, setHasChanges] = useState(false);
  
  // ヘッダーセクションは編集不可
  if (section.title === "_header") {
    return (
      <div className="mb-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {section.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
  
  const handleContentChange = (value: string) => {
    setEditContent(value);
    setHasChanges(value !== section.content);
  };
  
  const handleSave = () => {
    onUpdate(editContent);
    setHasChanges(false);
    onToggleEdit();
  };
  
  const handleCancel = () => {
    setEditContent(section.content);
    setHasChanges(false);
    onToggleEdit();
  };
  
  if (section.isEditing) {
    return (
      <Card className="mb-4 border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-foreground">
              {getSectionDisplayName(section.title)}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="h-7 px-2 text-[12px]"
              >
                <X className="mr-1 h-3 w-3" />
                キャンセル
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges}
                className="h-7 px-2 text-[12px]"
              >
                <Check className="mr-1 h-3 w-3" />
                保存
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Textarea
            value={editContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[200px] font-mono text-[13px]"
            placeholder="Markdown形式で入力..."
          />
          {hasChanges && (
            <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
              * 未保存の変更があります
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="group mb-4 border-border/50 transition-colors hover:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-foreground">
            {getSectionDisplayName(section.title)}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleEdit}
            className="h-7 px-2 text-[12px] opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Pencil className="mr-1 h-3 w-3" />
            編集
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="prose prose-sm max-w-none dark:prose-invert
          prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-muted-foreground
          prose-li:text-[13px] prose-li:text-muted-foreground
          prose-table:text-[12px] prose-th:bg-muted/50
          prose-strong:text-foreground
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {section.content || "*（内容なし）*"}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
