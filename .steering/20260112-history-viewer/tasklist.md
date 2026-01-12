# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 「時間の都合により別タスクとして実施予定」は禁止
- 「実装が複雑すぎるため後回し」は禁止
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

---

## フェーズ1: 型定義・基盤

- [x] types/history.ts を作成
  - [x] HistoryItem 型定義
  - [x] HistoryFilters 型定義
  - [x] SessionDetail 型定義

## フェーズ2: Server Actions

- [x] app/dashboard/history/actions.ts を作成
  - [x] getHistoryList(filters) 関数
  - [x] getSessionDetail(sessionId) 関数
  - [x] archiveSession(sessionId) 関数

## フェーズ3: 履歴一覧ページ

- [x] app/dashboard/history/page.tsx を作成
- [x] app/dashboard/history/_components/history-card.tsx を作成
- [x] app/dashboard/history/_components/history-list.tsx を作成
- [x] app/dashboard/history/_components/history-filters.tsx を作成

## フェーズ4: セッション詳細ページ

- [x] app/dashboard/history/[sessionId]/page.tsx を作成
  - [x] 診断入力内容表示
  - [x] 検索結果表示
  - [x] 比較マトリクス表示
  - [x] 稟議書表示
  - [x] 再開・再診断ボタン

## フェーズ5: サイドバー・ナビゲーション更新

- [x] components/layout/sidebar.tsx に履歴メニュー追加

## フェーズ6: 診断フォーム再開機能

- [x] app/dashboard/diagnosis/page.tsx でsessionId queryパラメータ対応
- [x] 既存セッションからのデータ復元ロジック追加

## フェーズ7: 品質チェックと修正

- [x] すべてのテストが通ることを確認
  - [x] `pnpm test` (テストがあれば)
- [x] リントエラーがないことを確認
  - [x] `pnpm lint`
- [x] 型エラーがないことを確認
  - [x] `pnpm tsc --noEmit`
- [x] ビルドが成功することを確認
  - [x] `pnpm build`

## フェーズ8: ドキュメント更新

- [x] 実装後の振り返り（このファイルの下部に記録）

---

## 実装後の振り返り

### 実装完了日
2026-01-12

### 計画と実績の差分

**計画と異なった点**:
- Next.js 16で`useSearchParams`をSuspenseでラップする必要があった
- HistoryFiltersコンポーネントもSuspense対応が必要だった

**新たに必要になったタスク**:
- Suspenseによるラップ追加（history/page.tsx, history-filters.tsx）

### 学んだこと

**技術的な学び**:
- Next.js App RouterでuseSearchParamsを使う際はSuspenseでラップが必須
- Server ActionsとSupabaseの組み合わせでの複雑なJOINクエリの書き方

**プロセス上の改善点**:
- 既存パターンに合わせた実装がスムーズだった
- Server Actionsを先に実装してからUIを作ると効率的

### 次回への改善提案
- 履歴削除機能の追加を検討
- 履歴のエクスポート機能があると便利
- 検索機能の追加でより使いやすく
