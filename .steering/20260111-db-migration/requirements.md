# 要求内容

## 概要

Supabase MCP Serverを使用して、初期DBスキーマ（users, tenants, tenant_members）をSupabaseプロジェクトに適用する。

## 背景

前フェーズでMVP基盤（認証、ルーティング、UIコンポーネント）の実装が完了した。
SQLマイグレーションファイル（`supabase/migrations/20260111000000_initial_schema.sql`）は作成済みだが、実際のSupabaseプロジェクトへの適用がまだ行われていない。

## 実装対象の機能

### 1. DBマイグレーション適用
- Supabase MCP Serverを使用してマイグレーションを実行
- users, tenants, tenant_members テーブルの作成
- RLSポリシーの設定
- トリガー・関数の作成

### 2. 動作確認
- ローカル環境でのログイン動作確認
- ユーザー作成時の自動プロファイル生成確認

## 受け入れ条件

### DBマイグレーション
- [ ] users テーブルがSupabase上に存在する
- [ ] tenants テーブルがSupabase上に存在する
- [ ] tenant_members テーブルがSupabase上に存在する
- [ ] RLSポリシーが正しく設定されている
- [ ] handle_new_user トリガーが動作する

### 動作確認
- [ ] ログインページが表示される
- [ ] マジックリンクでログインできる（または動作確認可能な状態）

## スコープ外

- 診断フォームの実装（次フェーズ）
- 検索・推薦機能（次フェーズ）

## 参照ドキュメント

- `docs/functional-design.md` - データモデル定義
- `supabase/migrations/20260111000000_initial_schema.sql` - マイグレーションSQL
