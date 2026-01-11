# リポジトリ構造定義書 (Repository Structure Document)

> **対応アーキテクチャ**: `docs/architecture.md`  
> **最終更新**: YYYY-MM-DD  
> **ステータス**: Draft / Review / Approved

---

## 1. ルート構造

```
project-root/
├── src/                    # アプリケーションソースコード
├── tests/                  # テストコード
├── docs/                   # プロジェクトドキュメント
├── public/                 # 静的ファイル
├── .github/                # GitHub設定・ワークフロー
├── scripts/                # ビルド・運用スクリプト
├── package.json
├── tsconfig.json
├── biome.json
└── README.md
```

---

## 2. src/ 詳細（Next.js App Router構成）

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 認証関連ページ（ルートグループ）
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/             # メインアプリ（ルートグループ）
│   │   ├── dashboard/
│   │   └── [feature]/
│   ├── api/                # API Routes
│   │   └── [resource]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/             # 共有UIコンポーネント
│   ├── ui/                 # 基盤コンポーネント（Button, Input等）
│   └── [feature]/          # 機能固有コンポーネント
├── lib/                    # ユーティリティ・設定
│   ├── supabase/           # Supabaseクライアント
│   ├── utils/              # 汎用ユーティリティ
│   └── constants.ts        # 定数
├── services/               # ビジネスロジック
│   └── [domain]/           # ドメイン単位
├── repositories/           # データアクセス層
│   └── [entity]/           # エンティティ単位
├── types/                  # 型定義
│   ├── database.ts         # Supabase生成型
│   └── [domain].ts         # ドメイン固有型
├── hooks/                  # カスタムフック
└── actions/                # Server Actions
    └── [feature]/
```

---

## 3. ディレクトリ詳細

### 3.1 app/ (Next.js App Router)

**責務**: ルーティング、ページ、レイアウト

**ルール**:
- ルートグループ `()` で認証有無を分離
- `page.tsx` はServer Component優先
- `loading.tsx`, `error.tsx` を活用

**配置ファイル**:
| ファイル | 用途 |
|---------|------|
| `page.tsx` | ページコンポーネント |
| `layout.tsx` | レイアウト |
| `loading.tsx` | ローディングUI |
| `error.tsx` | エラーUI |
| `not-found.tsx` | 404 UI |

### 3.2 components/

**責務**: 再利用可能なUIコンポーネント

**構造**:
```
components/
├── ui/                     # 基盤（shadcn/ui等）
│   ├── button.tsx
│   ├── input.tsx
│   └── index.ts            # バレルエクスポート
└── [feature]/              # 機能固有
    ├── FeatureCard.tsx
    └── FeatureList.tsx
```

**命名規則**:
- コンポーネント: `PascalCase.tsx`
- バレル: `index.ts`

### 3.3 services/

**責務**: ビジネスロジック（UIに依存しない処理）

**構造**:
```
services/
├── diagnosis/
│   ├── DiagnosisService.ts
│   └── types.ts
└── recommendation/
    ├── RecommendationService.ts
    ├── scoringAlgorithm.ts
    └── types.ts
```

**依存ルール**:
- ✅ `repositories/` を使用可能
- ❌ `components/`, `app/` への依存禁止

### 3.4 repositories/

**責務**: データアクセス抽象化（Supabase操作）

**構造**:
```
repositories/
├── user/
│   └── UserRepository.ts
└── diagnosis/
    └── DiagnosisRepository.ts
```

**依存ルール**:
- ✅ `lib/supabase/` を使用可能
- ❌ `services/`, `components/` への依存禁止

### 3.5 actions/

**責務**: Server Actions（フォーム送信、ミューテーション）

**構造**:
```
actions/
├── auth/
│   ├── login.ts
│   └── signup.ts
└── diagnosis/
    ├── createDiagnosis.ts
    └── updateDiagnosis.ts
```

---

## 4. 命名規則

### 4.1 ディレクトリ

| 種別 | 規則 | 例 |
|------|------|-----|
| レイヤー | 複数形 + kebab-case | `services/`, `repositories/` |
| 機能/ドメイン | 単数形 + kebab-case | `diagnosis/`, `user/` |
| ルートグループ | `()` + kebab-case | `(auth)/`, `(main)/` |

### 4.2 ファイル

| 種別 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `DiagnosisCard.tsx` |
| サービス/リポジトリ | PascalCase | `DiagnosisService.ts` |
| ユーティリティ | camelCase | `formatDate.ts` |
| 型定義 | camelCase または PascalCase | `diagnosis.ts`, `Database.ts` |
| 定数 | camelCase (内部は UPPER_SNAKE) | `constants.ts` |
| Server Actions | camelCase + 動詞 | `createDiagnosis.ts` |
| テスト | `[対象].test.ts` | `DiagnosisService.test.ts` |

### 4.3 エクスポート

| 種別 | 規則 |
|------|------|
| コンポーネント | named export |
| サービス/リポジトリ | named export (class or functions) |
| 型 | named export |
| バレル | `index.ts` で re-export |

---

## 5. 依存関係ルール

### 5.1 レイヤー間依存

```
app/ ─────┬─────────────────────────────────┐
          │                                 │
          ▼                                 ▼
     components/                       actions/
          │                                 │
          ▼                                 ▼
     services/ ◄────────────────────────────┘
          │
          ▼
     repositories/
          │
          ▼
     lib/supabase/
```

| From | To | 許可 |
|------|-----|------|
| app/ | components/, actions/, services/ | ✅ |
| components/ | services/, lib/, hooks/ | ✅ |
| actions/ | services/, repositories/ | ✅ |
| services/ | repositories/, lib/, types/ | ✅ |
| repositories/ | lib/supabase/, types/ | ✅ |
| 下位 → 上位 | - | ❌ |

### 5.2 循環依存の回避

- 循環が発生したら `types/` に共通型を抽出
- または依存関係を見直してレイヤーを再設計

---

## 6. テスト配置

```
tests/
├── unit/                   # ユニットテスト
│   ├── services/
│   │   └── DiagnosisService.test.ts
│   └── utils/
│       └── formatDate.test.ts
├── integration/            # 統合テスト
│   └── api/
│       └── diagnosis.test.ts
└── e2e/                    # E2Eテスト
    └── flows/
        └── diagnosis-flow.spec.ts
```

### 6.1 テストファイル命名

| 種別 | パターン | 例 |
|------|---------|-----|
| Unit | `[対象].test.ts` | `DiagnosisService.test.ts` |
| Integration | `[機能].test.ts` | `diagnosis.test.ts` |
| E2E | `[シナリオ].spec.ts` | `diagnosis-flow.spec.ts` |

---

## 7. docs/ 配置

```
docs/
├── product-requirements.md     # PRD
├── functional-design.md        # 機能設計
├── architecture.md             # アーキテクチャ
├── repository-structure.md     # 本ドキュメント
├── development-guidelines.md   # 開発ガイドライン
├── glossary.md                 # 用語集
└── ideas/                      # アイデア・壁打ちメモ
    └── initial-requirements.md
```

---

## 8. スケーリング方針

### 8.1 分割タイミング

| 兆候 | アクション |
|------|-----------|
| ディレクトリ内ファイル > 10 | サブディレクトリに分割 |
| 機能間の依存が複雑化 | Feature Module化 |
| 複数チームで開発 | Package分割（モノレポ） |

### 8.2 分割パターン

**現在（小規模）**: レイヤーベース
```
src/services/[domain]/
```

**成長後（中規模）**: Feature Module
```
src/features/[feature]/
├── components/
├── services/
├── repositories/
└── types/
```

---

## 変更履歴

| 日付 | 変更内容 | 理由 |
|------|---------|------|
| YYYY-MM-DD | 初版作成 | - |
