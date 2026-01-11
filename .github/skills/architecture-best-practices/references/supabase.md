# Supabase ベストプラクティス

## 目次
1. [クライアント作成](#クライアント作成)
2. [認証フロー](#認証フロー)
3. [RLS パターン](#rls-パターン)
4. [データ取得](#データ取得)
5. [Server Actions](#server-actions)
6. [型生成](#型生成)

---

## クライアント作成

### ✅ 環境別に分離

```typescript
// lib/supabase/server.ts - Server Components / Server Actions 用
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```typescript
// lib/supabase/client.ts - Client Components 用
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### ❌ アンチパターン

```typescript
// 単一クライアントを全環境で共有
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key) // ❌ cookie連携不可

// SERVICE_ROLE_KEY をクライアントで使用
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!) 
// ❌ RLSバイパス危険、漏洩リスク
```

---

## 認証フロー

### OAuth コールバック

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  return NextResponse.redirect(`${origin}/auth/error`)
}
```

### 認証チェック

```typescript
// ⚠️ getSession() ではなく getUser() を使う（JWT検証）
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  return <Dashboard user={user} />
}
```

### Client Component でのサインアウト

```tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return <button onClick={handleSignOut}>Sign Out</button>
}
```

### ❌ アンチパターン

```typescript
// getSession()のみで認証判定（JWT改ざんリスク）
const { data: { session } } = await supabase.auth.getSession()
if (session) { /* 危険 */ }

// JWT を localStorage に手動保存
localStorage.setItem('token', session.access_token) // SSRで壊れる
```

---

## RLS パターン

### 基本ポリシー

```sql
-- テーブル作成時に RLS を有効化
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 自分のデータのみ読み取り可能
CREATE POLICY "Users can read own articles" ON articles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 自分のデータのみ作成可能
CREATE POLICY "Users can create own articles" ON articles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分のデータのみ更新可能
CREATE POLICY "Users can update own articles" ON articles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 組織ベースアクセス制御

```sql
CREATE POLICY "Org members can access"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = documents.org_id
        AND org_members.user_id = auth.uid()
    )
  );
```

### 公開データ

```sql
-- 公開記事は誰でも読める（複数ポリシーは OR で評価）
CREATE POLICY "Public articles are readable" ON articles
  FOR SELECT
  USING (is_public = true);
```

### ❌ アンチパターン

```sql
-- RLS を無効化してアプリ側でフィルタリング
ALTER TABLE articles DISABLE ROW LEVEL SECURITY; -- ❌

-- 全許可ポリシー
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true); -- ❌

-- SELECT/INSERT/UPDATE/DELETEを一つの USING で
CREATE POLICY "CRUD" ON profiles FOR ALL
  USING (auth.uid() = user_id); -- ❌ INSERTは WITH CHECK が必要
```

---

## データ取得

### ✅ Server Components で取得

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ArticleList } from '@/components/article-list'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, created_at, author:profiles(name)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw new Error('Failed to fetch articles')

  return <ArticleList articles={articles} />
}
```

### 並列フェッチ

```typescript
export default async function DashboardPage() {
  const supabase = await createClient()
  
  const [articlesResult, statsResult] = await Promise.all([
    supabase.from('articles').select('*').limit(5),
    supabase.from('stats').select('*').single(),
  ])

  return (
    <>
      <ArticleList articles={articlesResult.data} />
      <Stats data={statsResult.data} />
    </>
  )
}
```

### ❌ アンチパターン

```tsx
// Client Componentでデータ取得（ウォーターフォール）
'use client'
export function ArticleList() {
  const [articles, setArticles] = useState([])
  
  useEffect(() => {
    supabase.from('articles').select('*')
      .then(({ data }) => setArticles(data))
  }, [])
  // → 初期表示遅延、SEO不利
}

// エラーハンドリング忘れ
const { data } = await supabase.from('articles').select('*')
return <List items={data} /> // dataがnullの可能性
```

---

## Server Actions

### ✅ 推奨パターン

```typescript
// app/articles/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
})

export async function createArticle(formData: FormData) {
  const supabase = await createClient()
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // バリデーション
  const parsed = ArticleSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // 挿入（RLS適用）
  const { error } = await supabase.from('articles').insert({
    title: parsed.data.title,
    content: parsed.data.content,
    author_id: user.id,
  })

  if (error) return { error: 'Failed to create article' }
  
  revalidatePath('/articles')
  return { success: true }
}
```

```tsx
// components/article-form.tsx
'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { createArticle } from '@/app/articles/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending}>
      {pending ? 'Saving...' : 'Create'}
    </button>
  )
}

export function ArticleForm() {
  const [state, action] = useFormState(createArticle, null)
  
  return (
    <form action={action}>
      <input name="title" required />
      {state?.error?.title && <span>{state.error.title}</span>}
      <textarea name="content" required />
      <SubmitButton />
    </form>
  )
}
```

### ❌ アンチパターン

```typescript
// 認証チェックなしでDB操作
'use server'
export async function deleteArticle(id: string) {
  await supabase.from('articles').delete().eq('id', id) // ❌
}

// バリデーションなし
export async function createArticle(data: any) {
  await supabase.from('articles').insert(data) // ❌
}
```

---

## 型生成

### 推奨: MCP経由

```bash
# Supabase MCP で型生成
mcp:supabase generate_types
# 出力: types/database.ts
```

### 型エイリアス定義

```typescript
// types/database.ts
export type Database = {
  public: {
    Tables: {
      articles: {
        Row: { id: string; title: string; author_id: string; ... }
        Insert: { title: string; author_id: string; ... }
        Update: { title?: string; ... }
      }
    }
  }
}

// 便利な型エイリアス
export type Article = Database['public']['Tables']['articles']['Row']
export type ArticleInsert = Database['public']['Tables']['articles']['Insert']
```

### 型安全なクエリ

```typescript
import type { Article } from '@/types/database'

const { data } = await supabase
  .from('articles')
  .select('*')
  .returns<Article[]>()

const newArticle: ArticleInsert = {
  title: 'Hello',
  author_id: user.id,
}
```

### ❌ アンチパターン

```typescript
// any型で逃げる
const { data } = await supabase.from('articles').select('*') as any

// 型生成せず手動定義（DBと乖離リスク）
type Article = { id: string; title: string }

// 生成ファイルを直接編集（再生成で上書き）
```
