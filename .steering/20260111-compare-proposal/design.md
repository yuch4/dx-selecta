# 設計: 比較機能 & 稟議書生成

## 1. 比較機能

### DBスキーマ

```sql
CREATE TABLE comparison_matrices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES search_runs(id) ON DELETE CASCADE,
  solutions UUID[] NOT NULL,           -- 比較対象のsolution_ids
  axes JSONB NOT NULL DEFAULT '[]',    -- 比較軸
  cells JSONB NOT NULL DEFAULT '[]',   -- セルデータ
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 比較軸（デフォルト）

| 軸ID | 軸名 | 説明 |
|------|------|------|
| name | 製品名 | 製品名とベンダー |
| category | カテゴリ | 製品カテゴリ |
| sso | SSO対応 | SSO対応状況 |
| audit_log | 監査ログ | 監査ログ対応 |
| api | API | API提供有無 |
| mobile | モバイル | モバイル対応 |
| score | スコア | 推薦スコア |

### UI設計

```
/compare?sessionId=xxx&solutions=id1,id2,id3

┌─────────────────────────────────────────────────────┐
│ 製品比較                                             │
├─────────────────────────────────────────────────────┤
│ ┌───────────┬──────────┬──────────┬──────────┐     │
│ │ 項目      │ 製品A    │ 製品B    │ 製品C    │     │
│ ├───────────┼──────────┼──────────┼──────────┤     │
│ │ ベンダー  │ ○○     │ ○○     │ ○○     │     │
│ │ SSO       │ ✓        │ ✓        │ -        │     │
│ │ 監査ログ  │ ✓        │ -        │ ✓        │     │
│ │ スコア    │ 85       │ 78       │ 72       │     │
│ └───────────┴──────────┴──────────┴──────────┘     │
│                                                     │
│ [CSVダウンロード]  [稟議書を生成 →]                 │
└─────────────────────────────────────────────────────┘
```

---

## 2. 稟議書生成

### DBスキーマ

```sql
CREATE TABLE proposal_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES search_runs(id) ON DELETE CASCADE,
  primary_solution_id UUID REFERENCES solutions(id),
  format TEXT DEFAULT 'markdown' CHECK (format IN ('markdown', 'google_docs')),
  markdown_text TEXT,
  google_doc_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  version INT DEFAULT 1
);
```

### テンプレート構造（Markdown）

```markdown
# SaaS導入稟議書

## 1. 概要
- **対象製品**: {製品名}
- **ベンダー**: {ベンダー名}
- **カテゴリ**: {カテゴリ}
- **起案日**: {日付}

## 2. 導入目的
{診断時の課題・ニーズから生成}

## 3. 選定理由
- 推薦スコア: {スコア}/100
- {推薦理由}

## 4. 製品概要
{製品説明}

## 5. 比較検討結果
| 項目 | {製品A} | {製品B} | {製品C} |
|------|---------|---------|---------|
| SSO  | ✓       | ✓       | -       |
| ...  | ...     | ...     | ...     |

## 6. 必須条件の充足
- [ ] SSO対応: {状況}
- [ ] 監査ログ: {状況}

## 7. リスクと対策
{懸念点と対応策}

## 8. 今後のスケジュール
1. トライアル申込
2. 評価
3. 契約
```

### UI設計

```
/proposal?sessionId=xxx&solutionId=yyy

┌─────────────────────────────────────────────────────┐
│ 稟議書                                               │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ # SaaS導入稟議書                                │ │
│ │                                                 │ │
│ │ ## 1. 概要                                      │ │
│ │ - **対象製品**: freee会計                       │ │
│ │ - **ベンダー**: freee株式会社                   │ │
│ │ ...                                             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [コピー]  [再生成]  [← 比較に戻る]                  │
└─────────────────────────────────────────────────────┘
```

---

## ファイル構成

```
src/
├── app/(dashboard)/compare/
│   ├── page.tsx
│   ├── actions.ts
│   └── _components/
│       └── compare-content.tsx
├── app/(dashboard)/proposal/
│   ├── page.tsx
│   ├── actions.ts
│   └── _components/
│       └── proposal-content.tsx
├── components/compare/
│   ├── compare-table.tsx
│   └── compare-actions.tsx
├── components/proposal/
│   ├── proposal-view.tsx
│   └── proposal-actions.tsx
└── types/
    ├── compare.ts
    └── proposal.ts
```
