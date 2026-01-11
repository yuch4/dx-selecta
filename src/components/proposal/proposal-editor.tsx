"use client";

import { useState, useCallback, useTransition } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Save, Pencil } from "lucide-react";
import { SectionEditor } from "./section-editor";
import { parseMarkdownToSections, sectionsToMarkdown } from "@/lib/proposal/parser";
import type { ProposalSection } from "@/lib/proposal/parser";
import type { ProposalOutput } from "@/types/proposal";
import { toast } from "sonner";

interface ProposalEditorProps {
  proposal: ProposalOutput;
  onSave: (markdownText: string) => Promise<ProposalOutput>;
}

export function ProposalEditor({ proposal, onSave }: ProposalEditorProps) {
  const [sections, setSections] = useState<ProposalSection[]>(() =>
    parseMarkdownToSections(proposal.markdown_text || "")
  );
  const [isPending, startTransition] = useTransition();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const handleToggleEdit = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, isEditing: !s.isEditing } : s
      )
    );
  }, []);
  
  const handleUpdateSection = useCallback((sectionId: string, content: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, content, isEditing: false } : s
      )
    );
    setHasUnsavedChanges(true);
  }, []);
  
  const handleSaveAll = () => {
    startTransition(async () => {
      try {
        const markdownText = sectionsToMarkdown(sections);
        const updated = await onSave(markdownText);
        setHasUnsavedChanges(false);
        toast.success("稟議書を保存しました", {
          description: `バージョン ${updated.version} として保存されました`,
        });
      } catch (error) {
        console.error("Save error:", error);
        toast.error("保存に失敗しました", {
          description: error instanceof Error ? error.message : "エラーが発生しました",
        });
      }
    });
  };
  
  const editingCount = sections.filter((s) => s.isEditing).length;
  
  return (
    <Card className="border-border/50">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Pencil className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold">稟議書を編集</h2>
              <p className="text-[12px] text-muted-foreground">
                各セクションをクリックして編集できます
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400">
                未保存の変更あり
              </span>
            )}
            <Button
              size="sm"
              onClick={handleSaveAll}
              disabled={isPending || !hasUnsavedChanges}
              className="h-8"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {isPending ? "保存中..." : "すべて保存"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-[13px] text-muted-foreground">
              編集可能なセクションがありません
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((section) => (
              <SectionEditor
                key={section.id}
                section={section}
                onUpdate={(content) => handleUpdateSection(section.id, content)}
                onToggleEdit={() => handleToggleEdit(section.id)}
              />
            ))}
          </div>
        )}
        
        {editingCount > 0 && (
          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-[12px] text-muted-foreground">
              {editingCount}件のセクションを編集中です。
              各セクションの「保存」をクリックして変更を確定してください。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
