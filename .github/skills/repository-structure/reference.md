# Repository Structure Reference

リポジトリ構造設計の詳細ガイド。

## 目次
1. [設計原則](#設計原則)
2. [命名規則詳細](#命名規則詳細)
3. [依存関係管理](#依存関係管理)
4. [スケーリングパターン](#スケーリングパターン)
5. [レビューチェックリスト](#レビューチェックリスト)
6. [よくある問題と対策](#よくある問題と対策)

---

## 設計原則

### 1. 単一責務
- 各ディレクトリは「1つの明確な役割」を持つ
- `stuff/`, `misc/`, `utils/`（曖昧な名前）を作らない
- `utils/` を使う場合は具体的なサブディレクトリに分割

**悪い例**:
```
src/
├── utils/          # 何でも入れる場所になりがち
└── helpers/        # utilsと何が違う？
```

**良い例**:
```
src/lib/
├── date/           # 日付関連ユーティリティ
├── validation/     # バリデーション関連
└── format/         # フォーマット関連
```

### 2. レイヤー分離
- アーキテクチャのレイヤーをディレクトリ構造に反映
- 上位→下位の一方向依存を強制

```
UI (app/, components/)
      ↓
Business Logic (services/)
      ↓
Data Access (repositories/)
      ↓
Infrastructure (lib/)
```

### 3. コロケーション
- 関連ファイルは近くに置く
- ただしレイヤー分離との兼ね合いを考慮

**Next.js App Routerでのコロケーション**:
```
app/dashboard/
├── page.tsx
├── loading.tsx
├── error.tsx
└── _components/    # このルート専用コンポーネント
```

---

## 命名規則詳細

### ディレクトリ命名

| パターン | 用途 | 例 |
|---------|------|-----|
| 複数形 + kebab | レイヤー | `services/`, `repositories/` |
| 単数形 + kebab | 機能/ドメイン | `diagnosis/`, `user-profile/` |
| `_` プレフィックス | プライベート（Next.js） | `_components/`, `_lib/` |
| `()` | ルートグループ（Next.js） | `(auth)/`, `(dashboard)/` |
| `[]` | 動的ルート（Next.js） | `[id]/`, `[...slug]/` |

### ファイル命名

| 種別 | パターン | 理由 |
|------|---------|------|
| Component | `PascalCase.tsx` | React慣例 |
| Hook | `use[Name].ts` | React慣例 |
| Context | `[Name]Context.tsx` | 識別しやすい |
| Service | `[Domain]Service.ts` | クラス/モジュール |
| Repository | `[Entity]Repository.ts` | クラス/モジュール |
| Action | `[verb][Noun].ts` | 動詞始まり |
| Type | `[domain].ts` | 小文字 |
| Constant | `constants.ts` | 単数形 |
| Test | `[target].test.ts` | Jest/Vitest慣例 |
| E2E | `[scenario].spec.ts` | Playwright慣例 |

### インポートパス

**パスエイリアス設定** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

**使用例**:
```typescript
// ✅ 良い
import { Button } from '@/components/ui'
import { DiagnosisService } from '@/services/diagnosis'

// ❌ 避ける（深い相対パス）
import { Button } from '../../../components/ui/button'
```

---

## 依存関係管理

### 許可される依存

```typescript
// app/ → services/ ✅
import { DiagnosisService } from '@/services/diagnosis'

// services/ → repositories/ ✅
import { DiagnosisRepository } from '@/repositories/diagnosis'

// repositories/ → lib/ ✅
import { supabase } from '@/lib/supabase/client'
```

### 禁止される依存

```typescript
// repositories/ → services/ ❌ 下位→上位
import { DiagnosisService } from '@/services/diagnosis'

// services/ → components/ ❌ ビジネスロジック→UI
import { DiagnosisCard } from '@/components/diagnosis'
```

### 循環依存の解決

**問題**:
```
ServiceA → ServiceB → ServiceA (循環)
```

**解決1**: 共通型を抽出
```
types/shared.ts ← ServiceA, ServiceB
```

**解決2**: 依存逆転
```
ServiceA → IServiceB (interface)
ServiceB implements IServiceB
```

---

## スケーリングパターン

### Phase 1: レイヤーベース（小規模）

```
src/
├── services/
│   ├── diagnosis/
│   ├── recommendation/
│   └── user/
└── repositories/
    ├── diagnosis/
    └── user/
```

**適用時期**: チーム1-3人、機能5個以下

### Phase 2: Feature Module（中規模）

```
src/features/
├── diagnosis/
│   ├── components/
│   ├── services/
│   ├── repositories/
│   ├── hooks/
│   └── types.ts
└── recommendation/
    ├── components/
    ├── services/
    └── ...
```

**適用時期**: チーム3-10人、機能10個以上

### Phase 3: Package分割（大規模）

```
packages/
├── diagnosis/
│   ├── src/
│   └── package.json
├── recommendation/
│   ├── src/
│   └── package.json
└── shared/
    ├── src/
    └── package.json
```

**適用時期**: 複数チーム、独立デプロイ必要

---

## レビューチェックリスト

### 構造
- [ ] ルート構造が定義されている
- [ ] src/ の詳細構造がある
- [ ] 各ディレクトリの責務が説明されている

### 命名規則
- [ ] ディレクトリ命名規則が定義されている
- [ ] ファイル命名規則が定義されている
- [ ] 一貫性がある

### 依存関係
- [ ] レイヤー間の依存ルールが明確
- [ ] 許可/禁止が表形式で定義されている
- [ ] 循環依存の禁止と回避策が書かれている

### テスト
- [ ] テストディレクトリ構造が定義されている
- [ ] テストファイル命名規則がある
- [ ] src/ との対応関係が明確

### ドキュメント
- [ ] docs/ の配置ルールがある
- [ ] 各ドキュメントの役割が明確

### スケーリング
- [ ] 分割タイミングの目安がある
- [ ] 分割パターンが定義されている

---

## よくある問題と対策

| 問題 | 原因 | 対策 |
|------|------|------|
| どこに置くか迷う | 責務が曖昧 | 配置ルールを表形式で明確化 |
| utils/ が肥大化 | 「とりあえず」で追加 | 具体的なサブディレクトリに分割 |
| 循環依存が発生 | 設計時に考慮不足 | 依存ルールを図示、CIでチェック |
| 命名がバラバラ | 規則がない/守られない | 命名規則を明文化、Lintで強制 |
| テストが見つからない | 配置ルールが不明確 | src/ とテストの対応を明記 |
| 分割タイミングがわからない | 基準がない | 数値目安を設定（ファイル数等） |

---

## Next.js App Router 固有のルール

### ルートグループ活用

```
app/
├── (marketing)/      # 認証不要ページ
│   ├── page.tsx      # ランディング
│   └── pricing/
├── (auth)/           # 認証フロー
│   ├── login/
│   └── signup/
└── (app)/            # 認証必須ページ
    ├── layout.tsx    # 認証チェック
    └── dashboard/
```

### プライベートフォルダ

```
app/dashboard/
├── page.tsx
├── _components/      # このルート専用（ルーティング対象外）
│   └── DashboardChart.tsx
└── _lib/             # このルート専用ユーティリティ
```

### コロケーションの判断

| 場合 | 配置先 |
|------|--------|
| 1つのルートでのみ使用 | `app/[route]/_components/` |
| 複数ルートで使用 | `src/components/` |
| 機能モジュール内で完結 | `src/features/[feature]/components/` |
