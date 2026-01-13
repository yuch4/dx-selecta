---
description: リファクタリングを「計画→実行→検証」まで安全に完了させる。動作を変えずにコードを改善する。完全実行モードで最後まで完走。
argument-hint: 対象 目的 例) 認証周りのコード 重複コード削除
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Refactor

動作を変えずにコードを改善するリファクタリング。
完全実行モードで最後まで完走する。

## 入力
$1 = リファクタ対象（例: 認証周りのコード / src/services/auth.ts）
$2 = 目的（例: 重複コード削除 / 可読性向上）

## 参照
- 開発規約: `docs/development-guidelines.md`
- アーキテクチャ: `docs/architecture.md`

## 実行手順

### 0) ブランチ判定
- Vercelデプロイ済み → ブランチ作成が必要
- 開発初期段階 → main で直接作業OK

ブランチ作成が必要な場合:
```bash
git checkout main && git pull origin main
git checkout -b refactor/<対象-kebab-case>
```

### 1) 計画（小さく分割）
以下を明確にする：
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
3. コミット

**重要**: 動作を変えない。機能追加・バグ修正は混ぜない。

### 3) 検証
```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

### 4) コミット & Push

ブランチの場合:
```bash
git push -u origin refactor/<対象名>
gh pr create --title "refactor: <内容>"
```

mainの場合:
```bash
git add . && git commit -m "refactor: <内容>"
git push origin main
```

### 5) 最終出力
- 作業ブランチ
- 改善した内容の要約
- 変更ファイル一覧
- 動作への影響: なし
