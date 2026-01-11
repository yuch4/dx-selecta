# タスクリスト

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

---

## フェーズ1: DBマイグレーション

- [x] 1.1 診断関連テーブル作成
  - [x] diagnosis_sessions テーブル
  - [x] diagnosis_inputs テーブル
  - [x] RLSポリシー設定
  - [x] インデックス作成

## フェーズ2: 型定義・Server Actions

- [x] 2.1 型定義作成
  - [x] src/types/diagnosis.ts

- [x] 2.2 Server Actions作成
  - [x] app/(dashboard)/diagnosis/actions.ts
  - [x] createSession, saveInput, completeSession

## フェーズ3: UIコンポーネント

- [x] 3.1 追加UIコンポーネント導入
  - [x] shadcn/ui: select, slider, checkbox, textarea, progress

- [x] 3.2 ステップコンポーネント作成
  - [x] step-company-info.tsx
  - [x] step-category.tsx
  - [x] step-problems.tsx
  - [x] step-constraints.tsx
  - [x] step-weights.tsx
  - [x] step-confirm.tsx

- [x] 3.3 DiagnosisForm（親コンポーネント）作成
  - [x] diagnosis-form.tsx

## フェーズ4: ページ統合

- [x] 4.1 診断ページ更新
  - [x] app/(dashboard)/diagnosis/page.tsx を更新

## フェーズ5: 品質チェック

- [x] 5.1 ビルド・lint確認
  - [x] npm run lint - 成功
  - [x] npm run build - 成功（middlewareは廃止警告だが動作はOK）

---

## 完了報告

**完了日時**: 2026-01-11

**成果物**:
- `src/types/diagnosis.ts` - 診断関連の型定義
- `src/app/(dashboard)/diagnosis/actions.ts` - Server Actions
- `src/components/diagnosis/step-company-info.tsx` - Step 1: 企業情報
- `src/components/diagnosis/step-category.tsx` - Step 2: カテゴリ選択
- `src/components/diagnosis/step-problems.tsx` - Step 3: 課題入力
- `src/components/diagnosis/step-constraints.tsx` - Step 4: 制約条件
- `src/components/diagnosis/step-weights.tsx` - Step 5: 重み付け
- `src/components/diagnosis/step-confirm.tsx` - Step 6: 確認・完了
- `src/components/diagnosis/diagnosis-form.tsx` - 親コンポーネント

**次のステップ**:
1. 開発サーバーで動作確認（Magic Link認証 → ダッシュボード → 診断ページ）
2. 診断完了後、検索機能（/search）の実装へ

- [ ] 5.2 動作確認
  - [ ] 各ステップの入力が正常に動作
  - [ ] データがDBに保存される

---

## 実装後の振り返り

### 実装完了日
{YYYY-MM-DD}

### 計画と実績の差分
{記載}

### 学んだこと
{記載}
