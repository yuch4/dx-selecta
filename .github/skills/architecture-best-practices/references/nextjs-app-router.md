# Next.js App Router ベストプラクティス

## 目次
1. [Server vs Client Components](#server-vs-client-components)
2. [データフェッチパターン](#データフェッチパターン)
3. [キャッシュ戦略](#キャッシュ戦略)
4. [エラーハンドリング](#エラーハンドリング)
5. [レイアウト設計](#レイアウト設計)

---

## Server vs Client Components

### 使い分け基準

| 要件 | 選択 |
|------|------|
| データフェッチ | Server Component |
| SEO重要コンテンツ | Server Component |
| useState/useEffect | Client Component |
| イベントハンドラ | Client Component |
| ブラウザAPI | Client Component |

### ✅ 推奨パターン

```tsx
// Server Component（デフォルト）
// app/articles/page.tsx
import { ArticleList } from '@/components/article-list'
import { getArticles } from '@/repositories/article.repository'

export default async function ArticlesPage() {
  const articles = await getArticles()
  return <ArticleList articles={articles} />
}

// Client Component - インタラクティブな部分のみ
// components/like-button.tsx
'use client'
import { useState } from 'react'

export function LikeButton({ articleId }: { articleId: string }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>♥</button>
}
```

### ❌ アンチパターン

```tsx
// 不要な 'use client'
'use client'
import { useEffect, useState } from 'react'

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  useEffect(() => {
    fetch('/api/articles').then(r => r.json()).then(setArticles)
  }, [])
  // 問題: Waterfall、SEO不利、UX低下
}
```

---

## データフェッチパターン

### RSC での直接フェッチ

```tsx
// app/dashboard/page.tsx
async function getStats() {
  const res = await fetch('https://api.example.com/stats', {
    next: { revalidate: 60 }
  })
  return res.json()
}

export default async function DashboardPage() {
  const stats = await getStats()
  return <Dashboard stats={stats} />
}
```

### Server Actions（ミューテーション）

```tsx
// app/actions/article.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function createArticle(formData: FormData) {
  const title = formData.get('title')
  await db.article.create({ data: { title } })
  revalidatePath('/articles')
}

// 使用側
<form action={createArticle}>
  <input name="title" />
  <button type="submit">作成</button>
</form>
```

### Route Handlers（外部API向け）

```tsx
// app/api/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  return Response.json({ received: true })
}
```

### ❌ アンチパターン

```tsx
// Server ComponentからRoute Handlerを呼ぶ（無駄なHTTP）
export default async function Page() {
  const res = await fetch('http://localhost:3000/api/articles') // ❌
  // → 直接repositoryを呼ぶ
}
```

---

## キャッシュ戦略

### 時間ベース revalidate

```tsx
// 60秒ごとに再検証
fetch(url, { next: { revalidate: 60 } })

// ページ全体に適用
export const revalidate = 60
```

### タグベース revalidation

```tsx
// データ取得時にタグ付け
fetch(url, { next: { tags: ['articles'] } })

// 更新時にタグで無効化
import { revalidateTag } from 'next/cache'

export async function updateArticle() {
  await db.article.update(...)
  revalidateTag('articles')
}
```

### cache() で重複排除

```tsx
import { cache } from 'react'

// 同一リクエスト内で複数回呼んでも1回だけ実行
export const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } })
})
```

### ❌ アンチパターン

```tsx
// 動的データに force-cache
fetch('/api/realtime-data', { cache: 'force-cache' }) // 古いデータ

// 全ページで revalidate: 0
export const revalidate = 0 // パフォーマンス低下
```

---

## エラーハンドリング

### error.tsx（エラーバウンダリ）

```tsx
// app/articles/error.tsx
'use client' // 必須

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={() => reset()}>再試行</button>
    </div>
  )
}
```

### not-found.tsx

```tsx
// app/articles/[id]/not-found.tsx
export default function ArticleNotFound() {
  return <div>記事が見つかりませんでした</div>
}

// page.tsx で使用
import { notFound } from 'next/navigation'

export default async function ArticlePage({ params }) {
  const article = await getArticle(params.id)
  if (!article) notFound()
  return <Article article={article} />
}
```

### loading.tsx（サスペンス境界）

```tsx
// app/articles/loading.tsx
export default function ArticlesLoading() {
  return <div className="animate-pulse">読み込み中...</div>
}
```

### ❌ アンチパターン

```tsx
// error.tsx を Server Component にする
export default function Error() { // 'use client' がない
  return <div>Error</div>
}

// try-catchで握りつぶす
export default async function Page() {
  try {
    const data = await getData()
    return <Component data={data} />
  } catch {
    return null // エラーが見えない
  }
}
```

---

## レイアウト設計

### 共有レイアウト

```tsx
// app/layout.tsx（ルートレイアウト）
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}

// app/dashboard/layout.tsx（ネストレイアウト）
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

### Route Groups（レイアウト共有制御）

```
app/
├── (marketing)/          # マーケティング用レイアウト
│   ├── layout.tsx
│   ├── page.tsx         # /
│   └── about/page.tsx   # /about
├── (app)/               # アプリ用レイアウト
│   ├── layout.tsx
│   └── dashboard/page.tsx  # /dashboard
```

### ❌ アンチパターン

```tsx
// レイアウトで毎回データ取得
export default async function Layout({ children }) {
  const user = await getUser() // 全ページで再取得
  return <UserContext value={user}>{children}</UserContext>
}
// → cache() を使うか、必要な場所で個別に取得
```
