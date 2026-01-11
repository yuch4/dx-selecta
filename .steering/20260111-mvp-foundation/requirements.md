# 要求内容

## 概要

DX Selecta MVPの基盤実装として、Supabase連携・認証・ルーティング構造・共通コンポーネントを構築する。

## 背景

PRD（product-requirements.md）で定義されたMVP機能「診断」「検索・推薦」「比較UI」「稟議生成」「認証・テナント管理」を実装するため、まず技術基盤を整える必要がある。
現状はNext.jsの初期スケルトン状態であり、Supabase連携・認証機構・UIコンポーネント基盤が未構築。

## 実装対象の機能

### 1. Supabase連携基盤
- Supabase Client（サーバー/クライアント）の初期化
- 型安全なDBアクセス（生成型定義）
- 環境変数の設定

### 2. 認証機構（Supabase Auth）
- メール/Google/Microsoft認証対応
- ミドルウェアによるルート保護
- 認証状態のグローバル管理

### 3. ルーティング構造
- App Router構成（(auth)/(dashboard)グループ）
- 認証済み/未認証ルートの分離
- 診断/検索/比較/稟議の各ページスケルトン

### 4. UIコンポーネント基盤
- shadcn/ui導入
- 共通レイアウト（サイドバー/ヘッダー）
- 基本フォームコンポーネント

### 5. データベーススキーマ（初期マイグレーション）
- User / Tenant / TenantMember テーブル
- RLS（Row Level Security）ポリシー設定

## 受け入れ条件

### Supabase連携
- [ ] `@supabase/ssr` を使用してサーバー/クライアントでSupabaseクライアントが利用可能
- [ ] 型定義が自動生成され、型安全にDBアクセスできる
- [ ] 環境変数（NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY等）が設定されている

### 認証機構
- [ ] `/login` でメール認証（マジックリンク）が可能
- [ ] 認証済みユーザーのみ `/dashboard` 以下にアクセスできる
- [ ] 未認証ユーザーは `/login` にリダイレクトされる

### ルーティング構造
- [ ] `app/(auth)/login/page.tsx` が存在し動作する
- [ ] `app/(dashboard)/` 配下に diagnosis, search, compare, proposal のディレクトリが存在
- [ ] レイアウトコンポーネントで共通UI（サイドバー）が適用される

### UIコンポーネント
- [ ] shadcn/ui が導入され、Button, Input, Card等の基本コンポーネントが利用可能
- [ ] ダッシュボードレイアウトにサイドバー・ヘッダーが表示される

### データベース
- [ ] users, tenants, tenant_members テーブルがSupabase上に作成済み
- [ ] RLSポリシーが設定され、自分のデータのみアクセス可能

## 成功指標

- 開発者がローカルで `npm run dev` 実行後、認証フロー（ログイン→ダッシュボード遷移）が動作する
- 型安全にSupabaseへのCRUD操作ができる

## スコープ外

以下はこのフェーズでは実装しません:

- 診断フォームの詳細ロジック（次フェーズ）
- ハイブリッド検索（pgvector）の実装（次フェーズ）
- 稟議生成のAI連携（次フェーズ）
- 外部認証（Google/Microsoft OAuth）の詳細設定（基盤のみ）
- E2Eテスト（別フェーズ）

## 参照ドキュメント

- `docs/product-requirements.md` - プロダクト要求定義書
- `docs/functional-design.md` - 機能設計書
- `docs/architecture.md` - アーキテクチャ設計書
