# 設計書: 提案書カスタマイズ機能

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                    ProposalPage                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ ProposalActions  │  │  ProposalEditor (NEW)            │ │
│  │ - 戻る/コピー/再生成│ │  ┌─────────────────────────────┐ │ │
│  └──────────────────┘  │  │ セクション1: 概要            │ │ │
│                        │  │ [編集] [プレビュー]          │ │ │
│  ┌──────────────────┐  │  ├─────────────────────────────┤ │ │
│  │ ProposalHistory  │  │  │ セクション2: 導入目的        │ │ │
│  │ - バージョン履歴  │  │  │ [編集] [プレビュー]          │ │ │
│  └──────────────────┘  │  ├─────────────────────────────┤ │ │
│                        │  │ ...                          │ │ │
│                        │  └─────────────────────────────┘ │ │
│                        └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### 1. ProposalEditor（新規）
```typescript
// src/components/proposal/proposal-editor.tsx

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  isEditing: boolean;
}

interface ProposalEditorProps {
  proposal: ProposalOutput;
  onSave: (sections: ProposalSection[]) => void;
}
```

### 2. SectionEditor（新規）
```typescript
// src/components/proposal/section-editor.tsx

interface SectionEditorProps {
  section: ProposalSection;
  onUpdate: (content: string) => void;
  onToggleEdit: () => void;
}
```

## データフロー

```
1. 生成済みMarkdown取得
       ↓
2. parseMarkdownToSections() でセクション分割
       ↓
3. ProposalEditor で表示
       ↓
4. ユーザーがセクション編集
       ↓
5. sectionsToMarkdown() で統合
       ↓
6. updateProposal() でDB保存（バージョン++）
```

## Markdown解析ロジック

```typescript
// Markdownをセクションに分割
function parseMarkdownToSections(markdown: string): ProposalSection[] {
  const sections: ProposalSection[] = [];
  const lines = markdown.split('\n');
  let currentSection: ProposalSection | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    // ## で始まる行が新セクション
    if (line.startsWith('## ')) {
      if (currentSection) {
        currentSection.content = contentLines.join('\n').trim();
        sections.push(currentSection);
      }
      currentSection = {
        id: crypto.randomUUID(),
        title: line.replace('## ', '').trim(),
        content: '',
        isEditing: false,
      };
      contentLines = [];
    } else {
      contentLines.push(line);
    }
  }

  // 最後のセクションを追加
  if (currentSection) {
    currentSection.content = contentLines.join('\n').trim();
    sections.push(currentSection);
  }

  return sections;
}
```

## DB変更

### proposal_outputs テーブル
現在の構造で対応可能（version, markdown_text）

- 編集時: 新しいレコードを INSERT（version++)
- 履歴表示: 同じ run_id + solution_id で version DESC

## UI/UX設計

### 編集モード切替
- セクションヘッダーに「編集」ボタン
- クリックで textarea に切り替え
- 「保存」「キャンセル」ボタン表示

### ビジュアルフィードバック
- 編集中: 背景色変更（薄い青）
- 保存成功: トースト通知
- 変更あり: 未保存インジケータ

## 実装ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/components/proposal/proposal-editor.tsx` | 新規作成 |
| `src/components/proposal/section-editor.tsx` | 新規作成 |
| `src/lib/proposal/parser.ts` | Markdown解析ユーティリティ |
| `src/app/dashboard/proposal/actions.ts` | updateProposal追加 |
| `src/components/proposal/proposal-view.tsx` | Editor統合 |
