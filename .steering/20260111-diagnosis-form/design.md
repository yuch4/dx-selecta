# 設計書

## アーキテクチャ概要

ステップ形式のマルチステップフォームで診断入力を実装。Server Actionsで保存。

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer                                                  │
│  - app/(dashboard)/diagnosis/page.tsx (メインページ)        │
│  - components/diagnosis/step-*.tsx (各ステップコンポーネント)│
│  - components/diagnosis/diagnosis-form.tsx (フォーム全体)    │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Server Actions)                                │
│  - app/(dashboard)/diagnosis/actions.ts                    │
│  - createSession, saveInput, completeSession               │
├─────────────────────────────────────────────────────────────┤
│  DB Layer                                                  │
│  - diagnosis_sessions テーブル                              │
│  - diagnosis_inputs テーブル                                │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### 1. DiagnosisForm（親コンポーネント）

**責務**:
- ステップ管理（現在のステップ、進捗）
- フォーム状態管理
- Server Actionsの呼び出し

### 2. 各ステップコンポーネント

| ステップ | コンポーネント | 入力項目 |
|---------|---------------|---------|
| 1 | StepCompanyInfo | 業種、規模、地域 |
| 2 | StepCategory | 対象カテゴリ（単一選択） |
| 3 | StepProblems | 課題（複数選択 + 自由記述） |
| 4 | StepConstraints | Must条件（予算、期限、SSO等） |
| 5 | StepWeights | 重み付け（スライダー） |
| 6 | StepConfirm | 確認・送信 |

## データフロー

```
1. ユーザーが診断ページにアクセス
2. セッション作成 (createSession Server Action)
3. 各ステップで入力 → 一時的にクライアント状態で保持
4. 最終ステップで保存 (saveInput Server Action)
5. セッション完了 (completeSession Server Action)
6. 検索ページへリダイレクト
```

## DBスキーマ

### diagnosis_sessions
```sql
CREATE TABLE diagnosis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### diagnosis_inputs
```sql
CREATE TABLE diagnosis_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES diagnosis_sessions(id) ON DELETE CASCADE,
  
  -- 会社属性
  company_industry TEXT NOT NULL,
  company_size TEXT NOT NULL CHECK (company_size IN ('1-50', '51-100', '101-300', '301-1000', '1001+')),
  company_region TEXT NOT NULL,
  
  -- カテゴリ
  category TEXT NOT NULL CHECK (category IN ('accounting', 'expense', 'attendance', 'hr', 'workflow', 'e_contract', 'invoice', 'procurement')),
  
  -- 課題
  problems TEXT[] NOT NULL DEFAULT '{}',
  problem_free_text TEXT,
  
  -- Must条件
  constraints JSONB NOT NULL DEFAULT '{}',
  
  -- 重み付け
  weights JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 依存ライブラリ

```json
{
  "dependencies": {
    "zod": "^3.x"  // バリデーション用（既に入っている可能性）
  }
}
```

## ディレクトリ構造

```
src/
├── app/(dashboard)/diagnosis/
│   ├── page.tsx
│   └── actions.ts
├── components/diagnosis/
│   ├── diagnosis-form.tsx
│   ├── step-company-info.tsx
│   ├── step-category.tsx
│   ├── step-problems.tsx
│   ├── step-constraints.tsx
│   ├── step-weights.tsx
│   └── step-confirm.tsx
└── types/
    └── diagnosis.ts
```

## 実装の順序

1. DBマイグレーション（diagnosis_sessions, diagnosis_inputs）
2. 型定義（types/diagnosis.ts）
3. Server Actions（actions.ts）
4. 各ステップコンポーネント
5. DiagnosisForm（親コンポーネント）
6. ページ統合・動作確認
