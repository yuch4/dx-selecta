# タスクリスト: 検索・推薦機能

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

---

## フェーズ1: DBスキーマ作成

- [x] 1.1 solutions テーブル作成（Supabase MCP）
- [x] 1.2 solution_facts テーブル作成
- [x] 1.3 search_runs テーブル作成
- [x] 1.4 search_results テーブル作成
- [x] 1.5 RLSポリシー設定
- [x] 1.6 サンプルデータ投入（10製品）

## フェーズ2: 型定義・Server Actions

- [x] 2.1 src/types/search.ts 作成
- [x] 2.2 src/app/(dashboard)/search/actions.ts 作成
  - [x] runSearch: 検索実行
  - [x] getSearchRun: 検索結果取得
  - [x] getSearchResults: 結果詳細

## フェーズ3: UIコンポーネント

- [x] 3.1 search-header.tsx - 診断サマリ表示
- [x] 3.2 search-result-card.tsx - 結果カード
- [x] 3.3 search-result-list.tsx - 結果一覧
- [x] 3.4 compare-action-bar.tsx - 比較アクション

## フェーズ4: ページ統合

- [x] 4.1 /search/page.tsx 更新
- [x] 4.2 診断完了後のリダイレクト設定

## フェーズ5: 品質チェック

- [x] 5.1 npm run lint - 成功
- [x] 5.2 npm run build - 成功

---

## 実装後の振り返り

### 実装完了日
2026-01-11

### 計画と実績の差分

**計画と異なった点**:
- useSearchParams()はSuspense境界が必要 → コンポーネント分離で対応
- badgeコンポーネントの追加が必要だった

**新たに必要になったタスク**:
- search-content.tsx を別コンポーネントとして分離

### 成果物一覧

**DBテーブル（Supabase MCP経由）**:
- solutions: SaaS製品マスタ（10件のサンプルデータ含む）
- solution_facts: 製品ファクト情報
- search_runs: 検索実行結果
- search_results: 検索結果詳細
- RLSポリシー設定済み

**ソースファイル**:
- `src/types/search.ts` - 型定義
- `src/app/(dashboard)/search/actions.ts` - Server Actions
- `src/app/(dashboard)/search/page.tsx` - 検索ページ
- `src/app/(dashboard)/search/_components/search-content.tsx` - 検索コンテンツ
- `src/components/search/search-header.tsx` - 診断条件サマリ
- `src/components/search/search-result-card.tsx` - 結果カード
- `src/components/search/search-result-list.tsx` - 結果一覧
- `src/components/search/compare-action-bar.tsx` - 比較アクションバー

### 次のステップ
1. 比較機能（/compare）の実装
2. 稟議書生成（/proposal）の実装
