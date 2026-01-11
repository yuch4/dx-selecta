```instructions
---
applyTo: "**/*"
---

# ブランチベース開発ワークフロー（Vercel連携）

> **適用条件**: このワークフローは **Vercelデプロイ後** に適用する。
> デプロイ前の開発段階では、mainブランチへの直接pushで問題ない。

## 背景

Vercelデプロイ済みの場合、mainブランチへのpushは**即座に本番環境に反映**される。
安全なリリースのため、デプロイ後は必ずブランチ + PR + Preview確認のフローを守ること。

## ブランチ命名規則

| 種別 | パターン | 例 |
|------|----------|-----|
| 新機能 | `feature/<短い説明>` | `feature/user-profile-edit` |
| バグ修正 | `fix/<短い説明>` | `fix/login-redirect-loop` |
| リファクタ | `refactor/<短い説明>` | `refactor/extract-auth-hook` |
| ドキュメント | `docs/<短い説明>` | `docs/api-reference` |
| 緊急修正 | `hotfix/<短い説明>` | `hotfix/critical-auth-bug` |

## 開発フロー

### 1) ブランチ作成
```bash
git checkout main
git pull origin main
git checkout -b feature/<機能名>
```

### 2) 実装 & コミット
- 小さく意味のある単位でコミット
- コミットメッセージは日本語OK、要点を簡潔に

```bash
git add .
git commit -m "feat: ユーザープロフィール編集画面を追加"
```

### 3) Push & PR作成
```bash
git push -u origin feature/<機能名>
```

GitHub上でPRを作成（またはGitHub CLIを使用）:
```bash
gh pr create --title "feat: ユーザープロフィール編集" --body "## 概要\n..."
```

### 4) Vercel Preview確認
- PRをpushすると自動でPreview環境がデプロイされる
- PRのコメントにPreview URLが投稿される
- Preview環境で動作確認を実施

### 5) レビュー & マージ
- レビュー依頼（必要に応じて）
- CI（lint/test/typecheck）が通っていることを確認
- Preview環境で問題なければ「Squash and merge」

### 6) 本番反映
- mainにマージされると自動で本番デプロイ
- 問題があればVercelダッシュボードからロールバック可能

## コミットメッセージ規約

```
<type>: <短い説明>

[本文（任意）]
```

**type一覧:**
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント
- `test`: テスト追加/修正
- `chore`: ビルド/設定変更

## 禁止事項

- ❌ mainブランチへの直接commit/push
- ❌ Preview確認なしでのマージ
- ❌ CIが落ちている状態でのマージ

## 緊急時（hotfix）

本番で重大なバグが見つかった場合:
1. `hotfix/<説明>` ブランチを作成
2. 最小限の修正を実施
3. PRを作成し、Previewで確認
4. 緊急レビュー後、即マージ

または、Vercelダッシュボードから前のデプロイにロールバック。

```
