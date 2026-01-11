# タスクリスト: 比較機能 & 稟議書生成

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

---

## フェーズ1: DBスキーマ作成

- [x] 1.1 comparison_matrices テーブル作成
- [x] 1.2 proposal_outputs テーブル作成
- [x] 1.3 RLSポリシー設定

## フェーズ2: 型定義

- [x] 2.1 src/types/compare.ts 作成
- [x] 2.2 src/types/proposal.ts 作成

## フェーズ3: 比較機能 Server Actions

- [x] 3.1 src/app/(dashboard)/compare/actions.ts 作成
  - [x] generateMatrix
  - [x] getMatrix
  - [x] exportCsv

## フェーズ4: 比較機能 UI

- [x] 4.1 compare-table.tsx - 比較テーブル
- [x] 4.2 compare-actions.tsx - アクションバー
- [x] 4.3 compare-content.tsx - クライアントコンポーネント
- [x] 4.4 /compare/page.tsx 更新

## フェーズ5: 稟議機能 Server Actions

- [x] 5.1 src/app/(dashboard)/proposal/actions.ts 作成
  - [x] generateProposal
  - [x] getProposal

## フェーズ6: 稟議機能 UI

- [x] 6.1 proposal-view.tsx - Markdown表示
- [x] 6.2 proposal-actions.tsx - アクションバー
- [x] 6.3 proposal-content.tsx - クライアントコンポーネント
- [x] 6.4 /proposal/page.tsx 更新

## フェーズ7: 品質チェック

- [x] 7.1 npm run lint ✅ (警告1件修正済み)
- [x] 7.2 npm run build ✅ (正常完了)

---

## 実装後の振り返り

### 実装完了日
2025-01-11

### 計画と実績の差分
- **計画通り**: DBスキーマ、型定義、Server Actions、UIコンポーネントすべて予定通り実装
- **追加対応**: react-markdown + remark-gfm のインストールが必要だった
- **修正対応**: useSearchParams のSuspense要件により、クライアントコンポーネントを _components/ フォルダに分離

### 学んだこと
1. Next.js 16でuseSearchParamsはSuspenseバウンダリ内で使用する必要がある
2. Server Actions内でテンプレートベースのMarkdown生成を行うことで、シンプルな実装が可能
3. 比較マトリクスはJSONBカラムで柔軟に格納できる
4. CSVエクスポートはServer Actionで生成し、クライアントでBlobダウンロード
