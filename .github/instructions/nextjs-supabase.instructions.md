---
applyTo: "src/**/*.{ts,tsx}"
---

# Next.js + Supabase スタック規約

## App Router

- Server Components をデフォルトとする（`'use client'` は必要な場合のみ）
- データ取得は Server Components で行い、props で Client Components に渡す
- Route Handlers（`app/api/`）でバックエンド処理

## Supabase

- サーバー: `@/lib/supabase/server` の `createClient()` を使用
- クライアント: `@/lib/supabase/client` の `createClient()` を使用
- 型は `@/types/database` から import

### Supabase MCP Server（必須）

スキーマ操作・型生成・データ確認には **Supabase CLI ではなく Supabase MCP Server** を使用すること。

```
# テーブル一覧取得
mcp:supabase list_tables

# テーブルスキーマ確認
mcp:supabase get_table_schema --table=articles

# TypeScript型生成
mcp:supabase generate_types

# マイグレーション実行
mcp:supabase apply_migration --name=add_column

# RLS確認
mcp:supabase get_policies --table=articles
```

**禁止**: `npx supabase` / `supabase` CLI の直接実行（MCP経由で操作する）

## レイヤー構造

```
src/
├── app/           # Routes, Pages, API
├── components/    # UI コンポーネント
├── lib/           # ユーティリティ、外部API クライアント
├── repositories/  # データアクセス層（Supabase操作）
├── services/      # ビジネスロジック
└── types/         # 型定義
```

## 依存関係ルール

- `app/` → `components/`, `services/`, `repositories/`, `lib/`
- `services/` → `repositories/`, `lib/`（他のserviceは避ける）
- `repositories/` → `lib/supabase/`, `types/`
- `components/` → `lib/`, `types/`

## エラーハンドリング

- カスタムエラーは `@/lib/errors` を使用
- API Routes では try-catch で適切な HTTP ステータスを返す
- ユーザー向けエラーメッセージと詳細ログを分離

## 命名規則

- ファイル: kebab-case（`article-collector.service.ts`）
- コンポーネント: PascalCase
- 関数/変数: camelCase
- 定数: UPPER_SNAKE_CASE
