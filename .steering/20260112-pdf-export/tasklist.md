# タスクリスト: PDF/PPTXエクスポート機能

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

---

## フェーズ1: 依存パッケージ

- [x] 1.1 @react-pdf/renderer インストール
  - [x] `npm install @react-pdf/renderer`

## フェーズ2: PDFコンポーネント実装

- [x] 2.1 lib/export/pdf-generator.ts 作成
  - [x] generateProposalPdf関数
  - [x] PdfMetadata型定義

- [x] 2.2 components/proposal/proposal-pdf.tsx 作成
  - [x] ProposalPdfDocument コンポーネント
  - [x] スタイル定義（フォント、カラー）
  - [x] セクションレンダリング
  - [x] テーブルレンダリング

## フェーズ3: ダウンロードUI

- [x] 3.1 components/proposal/download-menu.tsx 作成
  - [x] DropdownMenuでPDF/PPTX選択
  - [x] ローディング状態管理

- [x] 3.2 proposal-actions.tsx 更新
  - [x] DownloadMenu統合
  - [x] handleDownloadPdf関数

## フェーズ4: 統合

- [x] 4.1 proposal-content.tsx 更新
  - [x] ダウンロード機能をpropsで渡す

## フェーズ5: 品質チェック

- [x] 5.1 lint/build確認
  - [x] `npm run lint`
  - [x] `npm run build`

- [ ] 5.2 動作確認
  - [ ] PDFダウンロードフロー

---

## 実装後の振り返り

### 実装完了日
{YYYY-MM-DD}

### 計画と実績の差分
{実装後に記入}

### 学んだこと
{実装後に記入}
