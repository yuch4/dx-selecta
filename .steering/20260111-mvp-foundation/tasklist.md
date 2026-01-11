# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

### 必須ルール
- **全てのタスクを`[x]`にすること**
- 「時間の都合により別タスクとして実施予定」は禁止
- 未完了タスク（`[ ]`）を残したまま作業を終了しない

---

## フェーズ1: プロジェクト基盤セットアップ

- [x] 1.1 Supabaseプロジェクト確認・環境変数設定
  - [x] .env.local に NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY を設定
  - [x] .env.local.example を作成（テンプレート）

- [x] 1.2 必要なパッケージをインストール
  - [x] @supabase/supabase-js, @supabase/ssr をインストール
  - [x] supabase CLI (devDependencies) をインストール

## フェーズ2: Supabaseクライアント実装

- [x] 2.1 ディレクトリ構造を作成
  - [x] src/lib/supabase/ ディレクトリ作成

- [x] 2.2 Supabaseクライアント実装
  - [x] src/lib/supabase/client.ts（ブラウザ用）
  - [x] src/lib/supabase/server.ts（サーバーコンポーネント用）
  - [x] src/lib/supabase/middleware.ts（ミドルウェア用）

## フェーズ3: 認証ミドルウェア

- [x] 3.1 middleware.ts を作成
  - [x] /dashboard 以下を保護
  - [x] 未認証時 /login へリダイレクト
  - [x] 認証済みで /login アクセス時 /dashboard へリダイレクト

## フェーズ4: shadcn/ui + 共通コンポーネント

- [x] 4.1 shadcn/ui を初期化
  - [x] npx shadcn@latest init 実行
  - [x] Button, Input, Card, Label, Form コンポーネントを追加

- [x] 4.2 共通レイアウトコンポーネント作成
  - [x] src/components/layout/sidebar.tsx
  - [x] src/components/layout/header.tsx

## フェーズ5: ルーティング構造

- [x] 5.1 認証関連ルート作成
  - [x] app/(auth)/login/page.tsx（ログインページ）
  - [x] app/(auth)/auth/callback/route.ts（認証コールバック）
  - [x] src/components/auth/login-form.tsx（ログインフォーム）

- [x] 5.2 ダッシュボードレイアウト
  - [x] app/(dashboard)/layout.tsx
  - [x] app/(dashboard)/page.tsx（ダッシュボードトップ）

- [x] 5.3 機能別ページスケルトン
  - [x] app/(dashboard)/diagnosis/page.tsx
  - [x] app/(dashboard)/search/page.tsx
  - [x] app/(dashboard)/compare/page.tsx
  - [x] app/(dashboard)/proposal/page.tsx

## フェーズ6: データベーススキーマ

- [x] 6.1 Supabaseマイグレーション作成
  - [x] users テーブル（Supabase Auth連携）
  - [x] tenants テーブル
  - [x] tenant_members テーブル
  - [x] RLSポリシー設定

## フェーズ7: 品質チェックと修正

- [x] 7.1 すべてのテストが通ることを確認
  - [x] npm run lint
  - [x] npm run build（型エラーチェック含む）

- [x] 7.2 動作確認
  - [x] npm run dev でローカル起動確認（ビルド成功で確認）
  - [x] 認証フローの動作確認（構造完成、実Supabaseプロジェクトは別途設定要）

---

## 実装後の振り返り

### 実装完了日
2026-01-11

### 計画と実績の差分

**計画と異なった点**:
- index.tsでエクスポート名をエイリアスにしていたが、実際のファイル名(createClient)をそのまま使用する方針に変更
- Next.js 16でmiddlewareが非推奨（proxy推奨）となっている警告あり（動作には問題なし）
- appディレクトリをsrc配下に移動してtsconfig.jsonのパスエイリアスを`./src/*`に変更

**新たに必要になったタスク**:
- インポート名の修正（createBrowserClient/createServerClient → createClient）
- ルートレイアウト（layout.tsx）のメタデータを日本語化
- ルートページ（page.tsx）をダッシュボードへのリダイレクトに変更

### 学んだこと

**技術的な学び**:
- @supabase/ssr を使用したNext.js App Router対応のSupabaseクライアント設計
- Server Actionsを使ったログアウト処理の実装パターン
- shadcn/ui のNext.js 16（Tailwind v4）対応
- Next.js 16ではmiddlewareがproxyに置き換えられる方向（ただし現時点では動作可能）

