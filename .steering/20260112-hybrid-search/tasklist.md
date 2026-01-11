# タスクリスト: ハイブリッド検索（BM25 + pgvector）

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

---

## フェーズ1: データベース準備

- [x] 1.1 pgvector拡張の有効化確認
  - [x] Supabase MCPで拡張状態確認
  - [x] vector拡張を有効化

- [x] 1.2 solution_chunks テーブル作成
  - [x] マイグレーション作成・適用
  - [x] BM25用GINインデックス作成
  - [x] RLSポリシー設定

- [x] 1.3 サンプルチャンクデータ投入
  - [x] 既存solutions 10件に対してチャンクデータ投入（20件）
  - [x] 各製品2チャンク（features, security/integrations/pricing等）

## フェーズ2: OpenAI Client実装

- [x] 2.1 openaiパッケージインストール
  - [x] `npm install openai`

- [x] 2.2 lib/openai/client.ts 作成
  - [x] generateEmbedding関数実装
  - [x] generateEmbeddings（バッチ）関数実装
  - [x] エラーハンドリング

- [x] 2.3 環境変数設定確認
  - [x] OPENAI_API_KEY を .env.local.example に記載

## フェーズ3: Service層実装

- [x] 3.1 services/search/types.ts 作成
  - [x] HybridSearchParams, HybridSearchResult 型定義

- [x] 3.2 services/search/scoringAlgorithm.ts 作成
  - [x] calculateFinalScore関数実装
  - [x] 正規化ロジック

- [x] 3.3 services/search/hybridSearch.ts 作成
  - [x] BM25検索クエリ実装
  - [x] ベクトル検索クエリ実装
  - [x] スコア統合ロジック

## フェーズ4: Server Actions改修

- [x] 4.1 types/search.ts 更新
  - [x] MatchedChunk型追加
  - [x] SearchExplain型にmatchedChunks追加
  - [x] ScoreBreakdown型にハイブリッドスコア追加

- [x] 4.2 search/actions.ts 改修
  - [x] generateSearchQuery関数import
  - [x] runSearch内でhybridSearch呼び出し
  - [x] フォールバック処理（ベクトル検索失敗時はBM25のみ）

- [x] 4.3 PostgreSQL RPC関数作成
  - [x] search_chunks_bm25（BM25全文検索）
  - [x] search_chunks_vector（pgvectorベクトル検索）

## フェーズ5: 品質チェック

- [x] 5.1 lint/typecheck確認
  - [x] `npm run lint`（エラーなし）
  - [x] `npm run build`（成功）

- [ ] 5.2 動作確認
  - [ ] 診断→検索フローで結果表示確認

---

## 実装後の振り返り

### 実装完了日
2026-01-12

### 計画と実績の差分

**計画と異なった点**:
- PostgreSQL RPC関数の作成が計画に明示されていなかったため追加
- types/search.ts の修正範囲がScoreBreakdownにも及んだ
- diagnosis/actions.ts の型エラー修正が必要だった（既存の問題）

**新たに必要になったタスク**:
- search_chunks_bm25, search_chunks_vector RPC関数の作成
- Tenant型定義の追加（関連ファイルの型エラー修正）

### 学んだこと

**技術的な学び**:
- pgvectorのコサイン距離（<=>）は0-2の範囲を返すため、類似度への変換が必要
- PostgreSQL ts_rankでBM25風の全文検索が可能
- サービス層と型定義を分離することでテスタビリティが向上

**プロセス上の改善点**:
- DBマイグレーションとRPC関数は同時に計画すべき
- 型定義はUIで使う型とサービス内部の型を明確に分ける
