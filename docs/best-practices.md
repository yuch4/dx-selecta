# 実装ベストプラクティス

> **対応アーキテクチャ**: `docs/functional-design.md`  
> **最終更新**: 2026-01-11  
> **検出スタック**: Next.js App Router, Supabase, TypeScript

---

## 概要

本プロジェクト（DX Selecta）で採用している技術スタックの実装ベストプラクティス集。

**目的**:
- 一貫性のある実装パターンの共有
- よくある間違いの防止
- 新規メンバーのオンボーディング効率化

---

## 目次

1. [Next.js App Router](#nextjs-app-router)
2. [Supabase](#supabase)
3. [統合パターン](#統合パターン)
4. [アンチパターン集](#アンチパターン集)
5. [意思決定フローチャート](#意思決定フローチャート)

---

## Next.js App Router

### Server vs Client Components

| 要件 | 選択 |
|------|------|
| データフェッチ | Server Component |
| SEO重要コンテンツ | Server Component |
| useState/useEffect | Client Component |
| イベントハンドラ | Client Component |
| ブラウザAPI | Client Component |

**✅ 推奨**:
```tsx
// Server Component（デフォルト）
// app/diagnosis/page.tsx
import { DiagnosisList } from '@/components/diagnosis-list'
import { getDiagnosisSessions } from '@/repositories/diagnosis.repository'

export default async function DiagnosisPage() {
  const sessions = await getDiagnosisSessions()
  return <DiagnosisList sessions={sessions} />
}

// Client Component - インタラクティブな部分のみ
// components/save-button.tsx
'use client'
import { useState } from 'react'

export function SaveButton({ sessionId }: { sessionId: string }) {
  const [saving, setSaving] = useState(false)
  return <button onClick={() => setSaving(true)}>保存</button>
}
```

**❌ 避けるべき**:
```tsx
// 不要な 'use client'
'use client'
import { useEffect, useState } from 'react'

export default function DiagnosisPage() {
  const [sessions, setSessions] = useState([])
  useEffect(() => {
    fetch('/api/diagnosis').then(r => r.json()).then(setSessions)
  }, [])
  // 問題: Waterfall、SEO不利、UX低下
}
```

### データフェッチパターン

**RSC での直接フェッチ**:
```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: solutions } = await supabase
    .from('solutions')
    .select('*')
    .limit(10)
  
  return <SolutionList solutions={solutions} />
}
```

**Server Actions（ミューテーション）**:
```tsx
// app/actions/diagnosis.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function createDiagnosis(formData: FormData) {
  const category = formData.get('category')
  await db.diagnosisSession.create({ data: { category } })
  revalidatePath('/diagnosis')
}
```

### キャッシュ戦略

```tsx
// 時間ベース revalidate
fetch(url, { next: { revalidate: 60 } })

// タグベース revalidation
fetch(url, { next: { tags: ['solutions'] } })

// 更新時にタグで無効化
import { revalidateTag } from 'next/cache'
export async function updateSolution() {
  await db.solution.update(...)
  revalidateTag('solutions')
}
```

### エラーハンドリング

```tsx
// app/diagnosis/error.tsx
'use client' // 必須

export default function DiagnosisError({
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

// app/diagnosis/[id]/not-found.tsx
export default function DiagnosisNotFound() {
  return <div>診断セッションが見つかりませんでした</div>
}
```

---

## Supabase

### クライアント作成

**✅ 環境別に分離**:

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

**❌ アンチパターン**:
```typescript
// 単一クライアントを全環境で共有
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key) // ❌ cookie連携不可

// SERVICE_ROLE_KEY をクライアントで使用
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!) 
// ❌ RLSバイパス危険、漏洩リスク
```

### 認証フロー

```typescript
// ⚠️ getSession() ではなく getUser() を使う（JWT検証）
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  return <Dashboard user={user} />
}
```

### RLS パターン

```sql
-- テーブル作成時に RLS を有効化
CREATE TABLE diagnosis_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE diagnosis_sessions ENABLE ROW LEVEL SECURITY;

-- 自分のデータのみ読み取り可能
CREATE POLICY "Users can read own sessions" ON diagnosis_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 自分のデータのみ作成可能
CREATE POLICY "Users can create own sessions" ON diagnosis_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Server Actions（推奨パターン）

```typescript
// app/diagnosis/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const DiagnosisSchema = z.object({
  category: z.string().min(1),
  companySize: z.enum(['small', 'medium', 'large']),
})

export async function createDiagnosis(formData: FormData) {
  const supabase = await createClient()
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // バリデーション
  const parsed = DiagnosisSchema.safeParse({
    category: formData.get('category'),
    companySize: formData.get('companySize'),
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // 挿入（RLS適用）
  const { error } = await supabase.from('diagnosis_sessions').insert({
    category: parsed.data.category,
    company_size: parsed.data.companySize,
    user_id: user.id,
  })

  if (error) return { error: 'Failed to create diagnosis' }
  
  revalidatePath('/diagnosis')
  return { success: true }
}
```

### 型生成

```typescript
// types/database.ts - 便利な型エイリアス
export type DiagnosisSession = Database['public']['Tables']['diagnosis_sessions']['Row']
export type DiagnosisInsert = Database['public']['Tables']['diagnosis_sessions']['Insert']
export type Solution = Database['public']['Tables']['solutions']['Row']
```

---

## 統合パターン

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
// repositories/solution.repository.ts
import { createClient } from '@/lib/supabase/server'
import type { Solution } from '@/types/database'

export async function getSolutions(limit = 20): Promise<Solution[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getSolutionById(id: string): Promise<Solution | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
```

### ミドルウェア認証

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
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
| Server Component から Route Handler 呼び出し | 無駄な HTTP | 直接 Repository を呼ぶ |
| error.tsx を Server Component にする | エラー境界が機能しない | 'use client' 必須 |

---

## 意思決定フローチャート

### コンポーネント選択

```
データが必要？
├─ Yes → Server Component で取得
│        └─ Repository 経由で Supabase
└─ No → 静的 Server Component

インタラクション必要？
├─ Yes → その部分だけ Client Component に分離
└─ No → Server Component のまま
```

### データ操作選択

```
ミューテーション？
├─ フォーム送信 → Server Actions
│   ├─ Zod でバリデーション
│   ├─ 認証チェック必須
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

## 関連ドキュメント

- [機能設計書](functional-design.md) - システム構成とデータモデル
- [PRD](product-requirements.md) - プロダクト要件定義
