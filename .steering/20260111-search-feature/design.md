# 設計: 検索・推薦機能

## アーキテクチャ

```
診断完了 → /search?sessionId=xxx
           ↓
      Server Action: runSearch(sessionId)
           ↓
      1. diagnosis_inputs から条件取得
      2. solutions テーブルをフィルタ
      3. スコア計算
      4. search_runs/search_results に保存
           ↓
      結果表示（Top 5）
```

## DBスキーマ

### solutions テーブル
```sql
CREATE TABLE solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vendor TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (...)),
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  origin_country TEXT DEFAULT 'JP',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### solution_facts テーブル
```sql
CREATE TABLE solution_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  fact_type TEXT NOT NULL CHECK (fact_type IN ('sso', 'audit_log', 'data_residency', 'api', 'mobile', 'offline')),
  fact_value TEXT NOT NULL,
  evidence_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### search_runs テーブル
```sql
CREATE TABLE search_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES diagnosis_sessions(id) ON DELETE CASCADE,
  input_snapshot JSONB NOT NULL,
  total_candidates INT DEFAULT 0,
  executed_at TIMESTAMPTZ DEFAULT now(),
  duration_ms INT
);
```

### search_results テーブル
```sql
CREATE TABLE search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES search_runs(id) ON DELETE CASCADE,
  solution_id UUID REFERENCES solutions(id),
  rank INT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  score_breakdown JSONB,
  explain JSONB,
  concerns TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## スコアリングロジック（MVP簡易版）

```typescript
function calculateScore(solution, facts, input): number {
  let score = 50; // ベーススコア
  
  // カテゴリマッチ: +30
  if (solution.category === input.category) {
    score += 30;
  }
  
  // ファクトマッチ
  const ssoFact = facts.find(f => f.fact_type === 'sso');
  const auditFact = facts.find(f => f.fact_type === 'audit_log');
  
  if (input.constraints.requireSso && ssoFact?.fact_value === 'supported') {
    score += 10;
  }
  if (input.constraints.requireAuditLog && auditFact?.fact_value === 'supported') {
    score += 10;
  }
  
  return Math.min(score, 100);
}
```

## UI設計

### /search ページ
- 診断サマリ（カテゴリ、条件）の表示
- 結果カード一覧（Top 5）
  - 製品名、ベンダー、スコア
  - 推薦理由（Explain）
  - 比較に追加ボタン
- 比較へ進むボタン（選択済み製品がある場合）

### コンポーネント構成
```
/search/page.tsx (RSC)
├── SearchHeader.tsx - 診断サマリ
├── SearchResultList.tsx - 結果一覧
│   └── SearchResultCard.tsx - 個別カード
└── CompareActionBar.tsx - 比較アクションバー
```

## ファイル構成

```
src/
├── app/(dashboard)/search/
│   ├── page.tsx
│   └── actions.ts
├── components/search/
│   ├── search-header.tsx
│   ├── search-result-list.tsx
│   ├── search-result-card.tsx
│   └── compare-action-bar.tsx
└── types/
    └── search.ts
```
