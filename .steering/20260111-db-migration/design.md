# 設計書

## アーキテクチャ概要

Supabase MCP Serverを使用してマイグレーションを適用する。

```
┌─────────────────────────────────────────────────────────────┐
│  Supabase MCP Server                                       │
│  - apply_migration: DDL操作（テーブル作成等）                │
│  - execute_sql: データ操作・クエリ                          │
│  - list_tables: テーブル一覧確認                            │
└─────────────────────────────────────────────────────────────┘
```

## マイグレーション内容

### 1. users テーブル
- Supabase Auth（auth.users）と連携
- id, email, name, avatar_url, created_at, updated_at
- RLS: 自分のプロファイルのみ閲覧・更新可能
- トリガー: auth.users への INSERT 時に自動作成

### 2. tenants テーブル
- 組織情報を管理
- id, name, plan, search_scope, ingestion_mode, created_at, updated_at
- RLS: 所属テナントのみ閲覧可能、owner/adminのみ更新可能

### 3. tenant_members テーブル
- ユーザーとテナントの関連（多対多）
- id, tenant_id, user_id, role, created_at
- RLS: 所属テナントのメンバーのみ閲覧可能

## 適用手順

1. Supabase MCP Serverで現在のテーブル状態を確認
2. マイグレーションSQLを分割して段階的に適用
3. 適用後のテーブル・ポリシーを確認
4. ローカル環境で動作確認

## エラーハンドリング

- 既存テーブルがある場合: IF NOT EXISTS で対応済み
- トリガー重複: DROP IF EXISTS で対応済み
