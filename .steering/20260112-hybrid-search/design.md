# 設計書: ハイブリッド検索（BM25 + pgvector）

## アーキテクチャ概要

既存のレイヤー構造（Server Actions → Supabase）を維持しつつ、検索ロジックを Services層に分離してハイブリッド検索を実装。

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (search/page.tsx, search-result-card.tsx)        │
├─────────────────────────────────────────────────────────────┤
│  Server Actions (search/actions.ts)                        │
│  - runSearch() を改修、hybridSearch を呼び出し              │
├─────────────────────────────────────────────────────────────┤
│  Service Layer (新規)                                       │
│  - src/services/search/hybridSearch.ts                     │
│  - src/services/search/scoringAlgorithm.ts                 │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure (lib/)                                      │
│  - src/lib/openai/client.ts (Embedding生成)                │
│  - Supabase (PostgreSQL + pgvector)                        │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### 1. solution_chunks テーブル（DB）

**責務**: 製品ドキュメントのチャンク化データ + 埋め込みベクトル

**スキーマ**:
```sql
CREATE TABLE solution_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('pricing', 'features', 'security', 'integrations', 'cases', 'faq', 'general')),
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- OpenAI text-embedding-3-small
  source_url TEXT,
  content_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- BM25用インデックス
CREATE INDEX idx_solution_chunks_content_gin ON solution_chunks USING GIN (to_tsvector('simple', content));

-- ベクトル用インデックス（IVFFlat）
CREATE INDEX idx_solution_chunks_embedding ON solution_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 2. OpenAI Client (lib/openai/client.ts)

**責務**: Embedding生成

**実装の要点**:
- text-embedding-3-small モデル使用（1536次元、低コスト）
- シンプルな同期API呼び出し（バッチ化は将来対応）

```typescript
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}
```

### 3. hybridSearch.ts (Service)

**責務**: BM25 + ベクトル検索の実行・統合

**インターフェース**:
```typescript
interface HybridSearchParams {
  query: string;           // 検索クエリ（課題・要件から生成）
  solutionIds: string[];   // Mustフィルタ後の候補ID
  limit?: number;          // 取得件数（デフォルト5）
}

interface HybridSearchResult {
  solutionId: string;
  bm25Score: number;       // 0-1 正規化
  vectorScore: number;     // 0-1 コサイン類似度
  matchedChunks: MatchedChunk[];
}

async function hybridSearch(params: HybridSearchParams): Promise<HybridSearchResult[]>
```

**実装の要点**:
- BM25: `ts_rank(to_tsvector('simple', content), plainto_tsquery('simple', query))`
- Vector: `1 - (embedding <=> query_embedding)` でコサイン類似度
- 両スコアを0-1に正規化して統合

### 4. scoringAlgorithm.ts (Service)

**責務**: 最終スコア計算

```typescript
function calculateFinalScore(
  bm25Score: number,
  vectorScore: number,
  factMatchScore: number,
  weights: DiagnosisWeights
): number {
  // 関連度スコア（検索マッチ）
  const relevanceScore = bm25Score * 0.4 + vectorScore * 0.6;
  
  // 最終スコア（関連度50% + Mustマッチ50%）
  return (relevanceScore * 0.5 + factMatchScore * 0.5) * 100;
}
```

### 5. search/actions.ts 改修

**変更点**:
- `runSearch()` 内で `hybridSearch()` を呼び出し
- 検索クエリは診断入力（problems + problemFreeText + category）から生成
- matchedChunks を SearchExplain に追加

## データフロー

### 検索実行フロー
```
1. クライアント: runSearch(sessionId)
2. Server Action: 診断入力取得
3. Server Action: Mustフィルタ（既存）→ 候補ID取得
4. Service: generateSearchQuery(input) → クエリ文字列生成
5. Service: generateEmbedding(query) → クエリ埋め込み
6. Service: BM25検索 (PostgreSQL ts_rank)
7. Service: ベクトル検索 (pgvector <=>)
8. Service: スコア統合・ランキング
9. Server Action: 結果保存 + 返却
```

## エラーハンドリング戦略

### カスタムエラー
```typescript
class SearchError extends Error {
  constructor(message: string, public code: 'NO_CHUNKS' | 'EMBEDDING_FAILED' | 'DB_ERROR') {
    super(message);
  }
}
```

### エラーハンドリングパターン
- OpenAI API失敗 → ベクトル検索スキップ、BM25のみで結果返却
- solution_chunks が空 → 既存のfactベース検索にフォールバック
- タイムアウト（2秒超過） → 部分結果を返却

## テスト戦略

### ユニットテスト
- `scoringAlgorithm.test.ts`: スコア計算ロジック
- `hybridSearch.test.ts`: モック使用でロジック検証

### 統合テスト（将来）
- 実際のSupabaseに対するE2E検索テスト

## 依存ライブラリ

```json
{
  "dependencies": {
    "openai": "^4.x"
  }
}
```

## ディレクトリ構造

```
src/
├── lib/
│   └── openai/
│       └── client.ts          # 新規: OpenAI Client
├── services/
│   └── search/
│       ├── hybridSearch.ts    # 新規: ハイブリッド検索
│       ├── scoringAlgorithm.ts # 新規: スコア計算
│       └── types.ts           # 新規: 型定義
├── app/dashboard/search/
│   └── actions.ts             # 改修: hybridSearch呼び出し
└── types/
    └── search.ts              # 改修: MatchedChunk追加
```

## 実装の順序

1. pgvector拡張の有効化確認 + solution_chunks テーブル作成
2. サンプルチャンクデータ投入
3. OpenAI Client実装
4. scoringAlgorithm.ts 実装
5. hybridSearch.ts 実装
6. search/actions.ts 改修
7. search.ts 型定義更新
8. lint/build検証

## パフォーマンス考慮事項

- IVFFlat の lists パラメータは 100 で開始（製品数100〜300想定）
- 検索クエリの embedding は毎回生成（キャッシュは将来対応）
- PostgreSQL接続プールは Supabase 標準を使用

## 将来の拡張性

- バッチ Embedding 生成（製品登録時に事前計算）
- 日本語形態素解析の導入（pgroonga検討）
- Pinecone/Qdrant への移行パス
