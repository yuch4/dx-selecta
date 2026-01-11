# 設計書: PDF/PPTXエクスポート機能

## アーキテクチャ概要

```
Markdown稟議書
      ↓
parseMarkdownToSections()  ← 既存の parser.ts
      ↓
ProposalSection[]
      ↓
ProposalPdfDocument (React PDF Component)
      ↓
pdf() → Blob → download
```

## コンポーネント設計

### 1. ProposalPdfDocument（新規）
```typescript
// src/components/proposal/proposal-pdf.tsx

interface ProposalPdfDocumentProps {
  title: string;
  sections: ProposalSection[];
  metadata: {
    generatedAt: string;
    version: number;
    solutionName: string;
  };
}
```

### 2. PDF生成ユーティリティ（新規）
```typescript
// src/lib/export/pdf-generator.ts

export async function generateProposalPdf(
  markdown: string,
  metadata: PdfMetadata
): Promise<Blob>
```

### 3. ダウンロードボタン統合
```typescript
// proposal-actions.tsx に追加
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      <Download /> ダウンロード
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleDownloadPdf}>
      PDF形式
    </DropdownMenuItem>
    <DropdownMenuItem disabled>
      PPTX形式 (Coming Soon)
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## PDFスタイル設計

### ページレイアウト
```
┌─────────────────────────────────────┐
│ DX Selecta                 2026/01/12│  ← ヘッダー
├─────────────────────────────────────┤
│                                      │
│  SaaS導入稟議書                      │  ← タイトル
│                                      │
│  ## 1. 概要                          │  ← セクション
│  ┌─────────────────────────────────┐│
│  │ 対象製品 │ freee会計            ││  ← テーブル
│  │ ベンダー │ freee株式会社        ││
│  └─────────────────────────────────┘│
│                                      │
│  ## 2. 導入目的                      │
│  ...                                 │
│                                      │
├─────────────────────────────────────┤
│ Page 1 / 3                           │  ← フッター
└─────────────────────────────────────┘
```

### フォント設定
- タイトル: Noto Sans JP Bold, 24pt
- 見出し: Noto Sans JP Bold, 16pt
- 本文: Noto Sans JP Regular, 11pt
- テーブル: Noto Sans JP Regular, 10pt

### カラースキーム
- ヘッダー背景: #1a1a2e
- セクション見出し: #16213e
- 本文: #333333
- テーブルヘッダー: #f8f9fa

## 実装ファイル

| ファイル | 内容 |
|---------|------|
| `src/components/proposal/proposal-pdf.tsx` | PDFドキュメントコンポーネント |
| `src/lib/export/pdf-generator.ts` | PDF生成ユーティリティ |
| `src/components/proposal/download-menu.tsx` | ダウンロードドロップダウン |
| `src/components/proposal/proposal-actions.tsx` | 更新（ダウンロードボタン追加） |

## 依存パッケージ

```bash
npm install @react-pdf/renderer
```

## Markdown → PDF 変換ロジック

### 対応要素
- `# タイトル` → Page Title
- `## セクション` → Section Header
- `### サブセクション` → Subsection Header
- `| テーブル |` → Table
- `- リスト` → Bullet List
- `**太字**` → Bold Text
- `通常テキスト` → Text

### 制限事項
- 画像埋め込み非対応（MVPでは）
- コードブロック非対応
- ネストリスト非対応（1レベルのみ）
