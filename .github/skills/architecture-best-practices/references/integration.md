# Next.js + Supabase 統合パターン

## 目次
1. [ミドルウェア認証](#ミドルウェア認証)
2. [レイヤー構造](#レイヤー構造)
3. [意思決定フロー](#意思決定フロー)
4. [アンチパターン集](#アンチパターン集)

---

## ミドルウェア認証

### middleware.ts

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // 静的ファイル以外すべて
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### lib/supabase/middleware.ts

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションリフレッシュ（重要！）
  const { data: { user } } = await supabase.auth.getUser()

  // 保護ルートへの未認証アクセスをリダイレクト
  const protectedPaths = ['/dashboard', '/settings', '/admin']
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 認証済みユーザーがloginページにアクセスした場合
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
```

---

## レイヤー構造

### ディレクトリ構成

```
src/
├── app/           # Routes, Pages, API, Server Actions
├── components/    # UI コンポーネント
├── lib/           # ユーティリティ、外部APIクライアント
│   ├── supabase/  # Supabase クライアント（server/client/middleware）
│   └── errors.ts  # カスタムエラー
├── repositories/  # データアクセス層（Supabase操作）
├── services/      # ビジネスロジック
└── types/         # 型定義（database.ts含む）
```

### 依存関係ルール

```
app/ → components/, services/, repositories/, lib/
services/ → repositories/, lib/（他のserviceは避ける）
repositories/ → lib/supabase/, types/
components/ → lib/, types/
```

### 各層の責務

| レイヤー | 責務 | やること | やらないこと |
|---------|------|----------|-------------|
| app/ | ルーティング、ページ構成 | データ取得、Server Actions | ビジネスロジック |
| components/ | UI表示 | 表示、イベントハンドラ | データ取得、ビジネスロジック |
| services/ | ビジネスロジック | バリデーション、変換、複雑な処理 | 直接DB操作 |
| repositories/ | データアクセス | Supabaseクエリ、型変換 | ビジネスロジック |
| lib/ | ユーティリティ | 共通処理、外部API | ドメインロジック |

### Repository パターン例

```typescript
// repositories/article.repository.ts
import { createClient } from '@/lib/supabase/server'
import type { Article, ArticleInsert } from '@/types/database'

export async function getArticles(limit = 20): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createArticle(article: ArticleInsert): Promise<Article> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .insert(article)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Service パターン例

```typescript
// services/article.service.ts
import { getArticleById, createArticle } from '@/repositories/article.repository'
import type { ArticleInsert } from '@/types/database'

export async function publishArticle(
  articleId: string,
  userId: string
): Promise<void> {
  const article = await getArticleById(articleId)
  
  if (!article) throw new Error('Article not found')
  if (article.author_id !== userId) throw new Error('Unauthorized')
  if (article.is_published) throw new Error('Already published')
  
  // 公開処理...
}

export async function createArticleWithValidation(
  input: ArticleInsert,
  userId: string
): Promise<Article> {
  // ビジネスルールのバリデーション
  if (input.title.length < 5) {
    throw new Error('Title must be at least 5 characters')
  }
  
  return createArticle({
    ...input,
    author_id: userId,
  })
}
```

---

## 意思決定フロー

### コンポーネント選択

```
データが必要？
├─ Yes → Server Component で取得
│        └─ Supabase 直接 or Repository経由
└─ No → 静的 Server Component

インタラクション必要？
├─ Yes → その部分だけ Client Component に分離
└─ No → Server Component のまま
```

### データ操作選択

```
ミューテーション？
├─ フォーム送信 → Server Actions
│   └─ Zod でバリデーション
│   └─ 認証チェック必須
│   └─ revalidatePath/revalidateTag
└─ 外部連携/Webhook → Route Handlers
```

### Supabase クライアント選択

```
どこで使う？
├─ Server Component → lib/supabase/server
├─ Server Actions → lib/supabase/server
├─ Route Handlers → lib/supabase/server
├─ Middleware → lib/supabase/middleware
└─ Client Component → lib/supabase/client
```

---

## アンチパターン集

| パターン | 問題 | 解決策 |
|---------|------|--------|
| Client Component で useEffect データ取得 | Waterfall、SEO不利 | Server Component で取得 |
| 単一 Supabase クライアント共有 | Cookie 連携不可 | 環境別クライアント作成 |
| getSession() のみで認証判定 | JWT 改ざん検出不可 | getUser() を使う |
| RLS 無効化 | セキュリティリスク | ポリシーを正しく設定 |
| Server Actions でバリデーションなし | 不正データ挿入 | Zod でバリデーション |
| Repository で ビジネスロジック | 責務混在 | Service 層に分離 |
| Component で直接 Supabase クエリ | テスト困難、重複 | Repository 経由 |
| Middleware で重い DB 操作 | 全リクエスト遅延 | 認証チェックのみ |
| 型生成ファイルを手動編集 | 再生成で上書き | 型エイリアスを別ファイルに |
