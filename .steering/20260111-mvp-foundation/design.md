# 設計書

## アーキテクチャ概要

Next.js 16 App Router + Supabase (PostgreSQL + Auth) のサーバーレスアーキテクチャを採用。
アーキテクチャ設計書（docs/architecture.md）のレイヤー構成に準拠。

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (React Server/Client Components)                 │
│  - app/(dashboard)/layout.tsx (共通レイアウト)              │
│  - app/(auth)/login/page.tsx (認証ページ)                   │
│  - components/ui/ (shadcn/ui コンポーネント)                │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Server Actions)                                │
│  - app/(auth)/actions.ts (認証アクション)                   │
│  - middleware.ts (ルート保護)                               │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                      │
│  - src/lib/supabase/client.ts (ブラウザクライアント)        │
│  - src/lib/supabase/server.ts (サーバークライアント)        │
│  - src/lib/supabase/middleware.ts (ミドルウェア用)          │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### 1. Supabaseクライアント (`src/lib/supabase/`)

**責務**:
- ブラウザ/サーバー/ミドルウェアそれぞれのコンテキストに適したSupabaseクライアントを提供
- Cookie管理による認証セッション維持

**実装の要点**:
- `@supabase/ssr` を使用（Next.js App Router対応）
- サーバーコンポーネントでは `cookies()` を使用
- クライアントコンポーネントでは `createBrowserClient` を使用

### 2. 認証ミドルウェア (`middleware.ts`)

**責務**:
- 認証状態に基づくルート保護
- 認証トークンのリフレッシュ

**実装の要点**:
- `/dashboard` 以下は認証必須
- 未認証時は `/login` へリダイレクト
- `/login` に認証済みでアクセスした場合は `/dashboard` へリダイレクト

### 3. ダッシュボードレイアウト (`app/(dashboard)/layout.tsx`)

**責務**:
- サイドバー・ヘッダーの共通レイアウト提供
- ユーザー情報の表示

**実装の要点**:
- サーバーコンポーネントとして実装
- Supabaseからユーザー情報を取得して表示
- レスポンシブ対応（モバイルではサイドバー折りたたみ）

### 4. shadcn/uiコンポーネント (`src/components/ui/`)

**責務**:
- 再利用可能なUIコンポーネントの提供

**実装の要点**:
- shadcn/ui CLIで追加
- Button, Input, Card, Form, Label 等の基本コンポーネント

## データフロー

### 認証フロー（マジックリンク）
```
1. ユーザーがメールアドレスを入力
2. Server ActionでSupabase Auth signInWithOtpを呼び出し
3. メールにマジックリンクが送信される
4. ユーザーがリンクをクリック
5. `/auth/callback` でトークンを検証
6. セッションCookieを設定
7. `/dashboard` にリダイレクト
```

### ルート保護フロー
```
1. リクエストがmiddlewareに到達
2. Supabaseセッションを検証
3. 認証済み → 次へ進む
4. 未認証 + 保護ルート → /login へリダイレクト
5. 認証済み + /login → /dashboard へリダイレクト
```

## エラーハンドリング戦略

### 認証エラー
- 無効なトークン → ログインページへリダイレクト + エラーメッセージ表示
- ネットワークエラー → リトライ可能なエラー表示

### DBエラー
- RLS違反 → 403エラーとして処理、ログ記録
- 接続エラー → 500エラー + リトライ案内

## テスト戦略

### ユニットテスト（今回はスコープ外だが方針を記載）
- Supabaseクライアント初期化のテスト
- 認証アクションのモックテスト

### 統合テスト（今回はスコープ外）
- ログイン → ダッシュボードのE2Eフロー

## 依存ライブラリ

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.49.0",
    "@supabase/ssr": "^0.6.0"
  },
  "devDependencies": {
    "supabase": "^2.22.0"
  }
}
```

※ shadcn/ui はCLI経由で追加するため、直接の依存は`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`など

## ディレクトリ構造

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # /dashboard リダイレクト or overview
│   │   ├── diagnosis/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── compare/
│   │   │   └── page.tsx
│   │   └── proposal/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── auth/
│       └── login-form.tsx
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
└── middleware.ts
```

## 実装の順序

1. Supabaseプロジェクト設定・環境変数
2. Supabaseクライアント（client.ts, server.ts, middleware.ts）
3. middleware.ts（ルート保護）
4. shadcn/ui初期化 + 基本コンポーネント追加
5. 認証ページ（/login）とcallbackルート
6. ダッシュボードレイアウト（サイドバー・ヘッダー）
7. 各ページのスケルトン（diagnosis, search, compare, proposal）
8. DBスキーマ（Supabase Migration）
9. 動作確認・lint/typecheck

## セキュリティ考慮事項

- SUPABASE_SERVICE_ROLE_KEYはサーバーサイドのみで使用（クライアントに露出させない）
- RLSを有効化し、ユーザーは自分のテナントデータのみアクセス可能
- CSRFはNext.jsのServer Actionsで標準対応

## パフォーマンス考慮事項

- Supabaseクライアントはシングルトンパターンで初期化
- サーバーコンポーネントを優先し、クライアントコンポーネントは必要な部分のみ

## 将来の拡張性

- Google/Microsoft OAuthは `supabase.auth.signInWithOAuth` で追加可能
- テナント・招待機能は TenantMember テーブルで対応済み
