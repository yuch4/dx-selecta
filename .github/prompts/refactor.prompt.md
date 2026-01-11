---
description: リファクタリングを「計画→実行→検証」まで安全に完了させる
---

# Refactor

あなたはリポジトリに対して、動作を変えずにコードを改善するリファクタリングを行う実装者です。
このプロンプトは **完全実行モード**です。途中でユーザー確認を挟まず、作業を止めずに最後まで完走してください。
（ただし「削除」「大規模リネーム」が必要な場合のみ、実行直前に1行で注意喚起してから続行。）

## 入力
- リファクタ対象: ${input:target:例) 認証周りのコード / src/services/auth.ts}
- 目的: ${input:goal:例) 重複コード削除 / 可読性向上 / パフォーマンス改善}

## 参照
- 開発規約: `docs/development-guidelines.md`
- アーキテクチャ: `docs/architecture.md`
- スタック規約: `.github/instructions/nextjs-supabase.instructions.md`
- ブランチワークフロー: `.github/instructions/branching-workflow.instructions.md`

---

## 実行手順

### 0) ブランチ判定（止めない）

**Vercelデプロイ状況を判定**:
- `vercel.json` が存在 AND 本番デプロイ済み → **ブランチ作成が必要**
- それ以外（開発初期段階） → main ブランチで直接作業OK

**ブランチ作成が必要な場合**:
```bash
git checkout main
git pull origin main
git checkout -b refactor/<対象-kebab-case>
```

### 1) 計画（小さく分割）

リファクタリングは**小さいステップ**で行う。以下を明確にする:

1. 現状の問題点
2. 改善後の状態
3. ステップ分割（1ステップ = 1コミット単位）

例:
```
[ ] 1. 共通処理を関数に抽出
[ ] 2. 関数をutilsに移動
[ ] 3. 呼び出し元を更新
[ ] 4. 不要コード削除
```

### 2) 実行（1ステップずつ）

各ステップで:
1. 変更を実施
2. `pnpm typecheck` が通ることを確認
3. コミット（こまめに）

**重要**: 動作を変えない。機能追加・バグ修正は混ぜない。

### 3) 検証

すべてのステップ完了後:
- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

落ちたら直して再実行。

### 4) コミット & Push

**Vercelデプロイ済み（ブランチで作業中）の場合**:
```bash
git push -u origin refactor/<対象名>
```

PR作成:
```bash
gh pr create --title "refactor: <リファクタ内容>" --body "## 概要
<リファクタリングの目的と内容>

## 変更内容
- 変更1
- 変更2

## 動作への影響
なし（リファクタリングのみ）

## 確認事項
- [ ] Vercel Previewで動作確認
- [ ] 既存テスト通過
"
```

**デプロイ前（mainで作業中）の場合**:
```bash
git add .
git commit -m "refactor: <リファクタ内容>"
git push origin main
```

### 5) 最終出力（チャット返信）
- 作業ブランチ（mainまたはrefactor/xxx）
- 改善した内容の要約
- 変更ファイル一覧
- 動作への影響: なし（確認方法）
- **（ブランチの場合）次のアクション**: 「Vercel Previewで確認 → 問題なければPRをマージ」
