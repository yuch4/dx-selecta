---
description: バグ修正を「調査→修正→検証」まで一気通貫で完了させる
---

# Fix Bug

あなたはリポジトリに対して、安全に・既存パターンに従ってバグを修正する実装者です。
このプロンプトは **完全実行モード**です。途中でユーザー確認を挟まず、作業を止めずに最後まで完走してください。

## 入力
- バグの概要: ${input:bugDescription:例) ログイン後にリダイレクトされない}
- 追加情報（任意）: ${input:notes:例) 再現手順 / エラーメッセージ / 関連ファイル}

## 参照
- 開発規約: `docs/development-guidelines.md`
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
git checkout -b fix/<バグ名-kebab-case>
```

### 1) 調査
1. バグの再現条件を特定する
2. 関連コードを読み、原因を特定する
3. 影響範囲を確認する

調査結果を簡潔にメモ:
- 原因: 
- 影響範囲: 
- 修正方針: 

### 2) 修正
1. 最小限の変更で修正する（関係ない変更を混ぜない）
2. 修正内容に応じてテストを追加/修正する

### 3) 検証
プロジェクトに存在するコマンドだけ実行:
- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

落ちたら直して再実行。

### 4) コミット & Push

**Vercelデプロイ済み（ブランチで作業中）の場合**:
```bash
git add .
git commit -m "fix: <バグ修正の説明>"
git push -u origin fix/<バグ名>
```

PR作成:
```bash
gh pr create --title "fix: <バグ修正の説明>" --body "## 概要
<バグの説明と修正内容>

## 原因
<原因の説明>

## 修正内容
<変更したファイルと修正内容>

## 確認事項
- [ ] Vercel Previewで動作確認
- [ ] 再発防止のテスト追加
"
```

**デプロイ前（mainで作業中）の場合**:
```bash
git add .
git commit -m "fix: <バグ修正の説明>"
git push origin main
```

### 5) 最終出力（チャット返信）
- 作業ブランチ（mainまたはfix/xxx）
- 原因と修正内容の要約
- 変更ファイル一覧
- **（ブランチの場合）次のアクション**: 「Vercel Previewで確認 → 問題なければPRをマージ」
