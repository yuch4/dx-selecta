# 要求定義: 検索・推薦機能

## 背景
診断フォームが完成し、ユーザーは自社の要件を入力できるようになった。次のステップとして、入力された診断データをもとにSaaS製品を検索・推薦する機能が必要。

## 対象PRD機能
- PRD: 2. 検索・推薦（Must条件フィルタ、推薦Top3-5、Explain根拠）

## スコープ

### 実装範囲（In Scope）
1. **DBスキーマ**
   - Solution（SaaS製品マスタ）テーブル
   - SolutionFact（製品ファクト）テーブル
   - SearchRun（検索実行）テーブル
   - SearchResult（検索結果）テーブル
   - サンプルデータ投入

2. **Server Actions**
   - runSearch: 診断セッションから検索実行
   - getSearchRun: 検索結果取得
   - getSearchResults: 結果詳細取得

3. **検索ロジック**
   - Must条件によるフィルタリング（SSO必須、監査ログ必須、予算上限）
   - カテゴリマッチによるスコアリング
   - Top 5の推薦

4. **UI**
   - /search ページ：検索結果表示
   - 結果カード（製品名、スコア、推薦理由）
   - 比較選択UI

### スコープ外（Out of Scope）
- ベクトル検索（pgvector）- MVP後
- BM25全文検索 - MVP後
- SolutionChunk（ドキュメントチャンク）- MVP後
- 外部API連携（OpenAI埋め込み）- MVP後

## 成功基準
- 診断完了後、/search に遷移してTop 5製品が表示される
- Must条件（SSO、監査ログ）でフィルタリングが動作する
- 各製品に推薦理由（Explain）が表示される
