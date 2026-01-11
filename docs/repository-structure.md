# リポジトリ構造定義書 (Repository Structure Document)

> **対応アーキテクチャ**: `docs/architecture.md`  
> **最終更新**: 2025-01-11  
> **ステータス**: Draft

---

## 1. ルート構造

```
dx-selecta/
├── src/                    # アプリケーションソースコード
├── tests/                  # テストコード
├── docs/                   # プロジェクトドキュメント（※親リポジトリからシンボリックリンク検討）
├── public/                 # 静的ファイル（favicon, OGP等）
├── supabase/               # Supabase設定・マイグレーション
├── .github/                # GitHub Actions・PR テンプレート
├── scripts/                # ビルド・運用スクリプト
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── biome.json
├── next.config.ts
├── .env.local.example      # 環境変数テンプレート
└── README.md
```

---

## 2. src/ 詳細

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 認証系ページ（ログイン・サインアップ）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx      # 認証ページ共通レイアウト
│   ├── (dashboard)/        # 認証後メインアプリ
│   │   ├── diagnosis/      # 1. 診断
│   │   │   ├── page.tsx
│   │   │   ├── [sessionId]/
│   │   │   │   └── page.tsx
│   │   │   └── loading.tsx
│   │   ├── search/         # 2. 検索・推薦
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── compare/        # 3. 比較UI
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── proposal/       # 4. 稟議生成
│   │   │   ├── page.tsx
│   │   │   ├── [proposalId]/
│   │   │   │   └── page.tsx
│   │   │   └── loading.tsx
│   │   ├── settings/       # テナント設定
│   │   │   └── page.tsx
│   │   └── layout.tsx      # ダッシュボード共通レイアウト
│   ├── api/                # API Routes（必要に応じて）
│   │   └── webhooks/       # Webhook受信用
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # ランディング / リダイレクト
│   ├── globals.css
│   └── error.tsx           # グローバルエラー
│
├── components/             # 共有UIコンポーネント
│   ├── ui/                 # 基盤コンポーネント（shadcn/ui）
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   └── index.ts
│   ├── layout/             # レイアウト系
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── diagnosis/          # 診断機能固有
│   │   ├── DiagnosisForm.tsx
│   │   ├── CategorySelector.tsx
│   │   ├── WeightSlider.tsx
│   │   └── ConstraintInput.tsx
│   ├── search/             # 検索・推薦固有
│   │   ├── ResultCard.tsx
│   │   ├── ExplainPanel.tsx
│   │   └── FilterDrawer.tsx
│   ├── compare/            # 比較UI固有
│   │   ├── ComparisonMatrix.tsx
│   │   ├── MatrixCell.tsx
│   │   └── ExportButton.tsx
│   └── proposal/           # 稟議固有
│       ├── ProposalViewer.tsx
│       ├── MarkdownPreview.tsx
│       └── GoogleDocsExport.tsx
│
├── lib/                    # ユーティリティ・外部クライアント
│   ├── supabase/
│   │   ├── client.ts       # ブラウザ用クライアント
│   │   ├── server.ts       # Server Component用
│   │   └── middleware.ts   # 認証ミドルウェア
│   ├── openai/
│   │   └── client.ts       # OpenAI API クライアント
│   ├── google/
│   │   └── docs.ts         # Google Docs API
│   └── utils/
│       ├── formatDate.ts
│       ├── formatCurrency.ts
│       └── cn.ts           # tailwind-merge
│
├── services/               # ビジネスロジック
│   ├── diagnosis/
│   │   ├── DiagnosisService.ts
│   │   ├── validation.ts   # Zodスキーマ
│   │   └── types.ts
│   ├── search/
│   │   ├── SearchService.ts
│   │   ├── scoringAlgorithm.ts
│   │   ├── hybridSearch.ts
│   │   └── types.ts
│   ├── compare/
│   │   ├── CompareService.ts
│   │   └── types.ts
│   ├── proposal/
│   │   ├── ProposalService.ts
│   │   ├── templateEngine.ts
│   │   └── types.ts
│   └── auth/
│       ├── AuthService.ts
│       └── types.ts
│
├── repositories/           # データアクセス層
│   ├── user/
│   │   └── UserRepository.ts
│   ├── tenant/
│   │   └── TenantRepository.ts
│   ├── diagnosis/
│   │   └── DiagnosisRepository.ts
│   ├── solution/
│   │   ├── SolutionRepository.ts
│   │   └── SolutionChunkRepository.ts
│   ├── search/
│   │   └── SearchRunRepository.ts
│   └── proposal/
│       └── ProposalRepository.ts
│
├── actions/                # Server Actions
│   ├── auth/
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   └── signup.ts
│   ├── diagnosis/
│   │   ├── createSession.ts
│   │   ├── saveInput.ts
│   │   └── completeSession.ts
│   ├── search/
│   │   └── recommend.ts
│   ├── compare/
│   │   ├── createMatrix.ts
│   │   └── updateMatrix.ts
│   └── proposal/
│       ├── generate.ts
│       └── exportToDocs.ts
│
├── hooks/                  # カスタムフック
│   ├── useAuth.ts
│   ├── useDiagnosis.ts
│   ├── useSearch.ts
│   └── useProposal.ts
│
└── types/                  # 型定義
    ├── database.ts         # Supabase生成型
    ├── diagnosis.ts
    ├── search.ts
    ├── compare.ts
    └── proposal.ts
```

---

## 3. ディレクトリ詳細

### 3.1 app/ (Next.js App Router)

**責務**: ルーティング、ページ、レイアウト

**ルール**:
- ルートグループ `(auth)`, `(dashboard)` で認証状態を分離
- `page.tsx` はServer Component優先（データフェッチはここで）
- `loading.tsx`, `error.tsx` を各機能で活用

**配置ファイル**:
| ファイル | 用途 |
|---------|------|
| `page.tsx` | ページコンポーネント（RSC） |
| `layout.tsx` | レイアウト（認証チェック含む） |
| `loading.tsx` | Suspense fallback |
| `error.tsx` | Error Boundary |
| `not-found.tsx` | 404 UI |

### 3.2 components/

**責務**: 再利用可能なUIコンポーネント

**構造方針**:
```
components/
├── ui/            # shadcn/ui ベース（汎用）
└── [feature]/     # 機能固有（diagnosis/, search/, etc.）
```

**命名規則**:
- ファイル名: `PascalCase.tsx`
- バレルエクスポート: `index.ts`

### 3.3 services/

**責務**: ビジネスロジック（UIに依存しない処理）

**依存ルール**:
- ✅ `repositories/` を使用可能
- ✅ `lib/` を使用可能
- ✅ `types/` を使用可能
- ❌ `components/`, `app/`, `actions/` への依存禁止

**サービス一覧（PRD機能対応）**:
| サービス | PRD機能 | 責務 |
|---------|--------|------|
| DiagnosisService | 1. 診断 | セッション管理、入力保存 |
| SearchService | 2. 検索・推薦 | ハイブリッド検索、スコアリング |
| CompareService | 3. 比較UI | マトリクス生成・更新 |
| ProposalService | 4. 稟議生成 | テキスト生成、Docs出力 |
| AuthService | 5. 認証 | ユーザー・テナント管理 |

### 3.4 repositories/

**責務**: データアクセス抽象化（Supabase操作）

**依存ルール**:
- ✅ `lib/supabase/` を使用可能
- ✅ `types/` を使用可能
- ❌ `services/`, `components/`, `app/` への依存禁止

**パターン**:
```typescript
// repositories/diagnosis/DiagnosisRepository.ts
export class DiagnosisRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async findById(id: string) { ... }
  async create(data: CreateDiagnosisDTO) { ... }
  async update(id: string, data: UpdateDiagnosisDTO) { ... }
}
```

### 3.5 actions/

**責務**: Server Actions（フォーム送信、ミューテーション）

**依存ルール**:
- ✅ `services/` を使用可能
- ✅ `repositories/` を直接使用可能（シンプルなCRUD）
- ✅ `lib/supabase/server` を使用可能

**パターン**:
```typescript
// actions/diagnosis/createSession.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { DiagnosisService } from '@/services/diagnosis/DiagnosisService'

export async function createSession(formData: FormData) {
  const supabase = await createClient()
  const service = new DiagnosisService(supabase)
  return service.createSession(...)
}
```

---

## 4. 命名規則

### 4.1 ディレクトリ

| 種別 | 規則 | 例 |
|------|------|-----|
| レイヤー | 複数形 + kebab-case | `services/`, `repositories/` |
| 機能/ドメイン | 単数形 + kebab-case | `diagnosis/`, `search/` |
| ルートグループ | `()` + kebab-case | `(auth)/`, `(dashboard)/` |

### 4.2 ファイル

| 種別 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `DiagnosisForm.tsx` |
| サービス | PascalCase | `DiagnosisService.ts` |
| リポジトリ | PascalCase | `DiagnosisRepository.ts` |
| Server Actions | camelCase + 動詞 | `createSession.ts` |
| ユーティリティ | camelCase | `formatDate.ts` |
| 型定義 | camelCase | `diagnosis.ts` |
| 定数 | camelCase (内部は UPPER_SNAKE) | `constants.ts` |
| テスト | `[対象].test.ts` | `DiagnosisService.test.ts` |
| E2Eテスト | `[シナリオ].spec.ts` | `diagnosis-flow.spec.ts` |

### 4.3 エクスポート

| 種別 | 規則 |
|------|------|
| コンポーネント | named export |
| サービス/リポジトリ | named export (class or functions) |
| 型 | named export |
| バレル | `index.ts` で re-export |

---

## 5. 依存関係ルール

### 5.1 レイヤー間依存図

```
app/pages ────────────────────────────────────┐
     │                                        │
     ▼                                        ▼
components/                              actions/
     │                                        │
     └─────────────┬──────────────────────────┘
                   │
                   ▼
              services/
                   │
                   ▼
            repositories/
                   │
                   ▼
           lib/supabase/
```

### 5.2 依存マトリクス

| From → To | app/ | components/ | actions/ | services/ | repositories/ | lib/ | types/ |
|-----------|------|-------------|----------|-----------|---------------|------|--------|
| **app/** | - | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **components/** | ❌ | - | ❌ | ❌ | ❌ | ✅ | ✅ |
| **actions/** | ❌ | ❌ | - | ✅ | ✅ | ✅ | ✅ |
| **services/** | ❌ | ❌ | ❌ | - | ✅ | ✅ | ✅ |
| **repositories/** | ❌ | ❌ | ❌ | ❌ | - | ✅ | ✅ |
| **lib/** | ❌ | ❌ | ❌ | ❌ | ❌ | - | ✅ |
| **types/** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | - |

### 5.3 循環依存の回避

- 循環が発生したら `types/` に共通型を抽出
- サービス間依存は `services/` 内で直接ではなく、上位（actions）で組み合わせる

---

## 6. テスト配置

```
tests/
├── unit/                       # ユニットテスト
│   ├── services/
│   │   ├── DiagnosisService.test.ts
│   │   ├── SearchService.test.ts
│   │   └── scoringAlgorithm.test.ts
│   └── utils/
│       └── formatDate.test.ts
├── integration/                # 統合テスト
│   ├── actions/
│   │   ├── diagnosis.test.ts
│   │   └── search.test.ts
│   └── repositories/
│       └── DiagnosisRepository.test.ts
└── e2e/                        # E2Eテスト（Playwright）
    └── flows/
        ├── auth.spec.ts
        ├── diagnosis-flow.spec.ts
        ├── search-compare.spec.ts
        └── proposal-generation.spec.ts
```

### 6.1 テストファイル命名

| 種別 | パターン | 例 |
|------|---------|-----|
| Unit | `[対象].test.ts` | `DiagnosisService.test.ts` |
| Integration | `[機能].test.ts` | `diagnosis.test.ts` |
| E2E | `[シナリオ].spec.ts` | `diagnosis-flow.spec.ts` |

### 6.2 テスト対象優先度（アーキテクチャ連携）

| 対象 | Unit | Integration | E2E |
|------|------|-------------|-----|
| scoringAlgorithm | ✅ | - | - |
| DiagnosisService | ✅ | - | - |
| SearchService | ✅ | ✅ | - |
| Server Actions | - | ✅ | - |
| 診断→稟議フロー | - | - | ✅ |
| 認証フロー | - | ✅ | ✅ |

---

## 7. supabase/ 配置

```
supabase/
├── migrations/             # DBマイグレーション
│   ├── 20250111000000_create_users.sql
│   ├── 20250111000001_create_tenants.sql
│   └── ...
├── functions/              # Edge Functions
│   ├── hybrid-search/
│   │   └── index.ts
│   └── generate-embedding/
│       └── index.ts
├── seed.sql                # 開発用シードデータ
└── config.toml             # Supabase CLI設定
```

---

## 8. スケーリング方針

### 8.1 現在（MVP）: レイヤーベース構成

```
src/
├── services/[domain]/
├── repositories/[entity]/
└── components/[feature]/
```

### 8.2 分割タイミング

| 兆候 | アクション |
|------|-----------|
| ディレクトリ内ファイル > 10 | サブディレクトリに分割 |
| 機能間の依存が複雑化 | Feature Module化を検討 |
| 複数チームで開発 | packages/ でモノレポ化 |

### 8.3 成長後（中規模）: Feature Module化

```
src/features/
├── diagnosis/
│   ├── components/
│   ├── services/
│   ├── repositories/
│   ├── actions/
│   └── types.ts
├── search/
│   └── ...
└── proposal/
    └── ...
```

---

## 変更履歴

| 日付 | 変更内容 | 理由 |
|------|---------|------|
| 2025-01-11 | 初版作成 | アーキテクチャ設計書 v1.0 対応 |

