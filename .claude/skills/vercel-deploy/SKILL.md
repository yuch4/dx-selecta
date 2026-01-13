---
name: vercel-deploy
description: Vercelへのデプロイ操作を実行する。プレビュー/本番デプロイ、環境変数管理、デプロイ状態確認、ロールバック、ドメイン設定など。「Vercelにデプロイ」「プレビュー環境を作成」「本番反映」「デプロイログ確認」「環境変数を設定」などの依頼時に使用。
allowed-tools: Bash, Read
---

# Vercel Deploy Skill

Vercel CLIを使用したデプロイ操作を支援する。

## 前提条件

- Vercel CLIがインストール済み（`pnpm add -g vercel`）
- `vercel login` で認証済み
- プロジェクトがVercelにリンク済み（`.vercel/project.json` が存在）

## デプロイワークフロー

### 1. プレビューデプロイ（推奨フロー）

```bash
# ビルド検証
pnpm build

# プレビューデプロイ（PRごとの確認用）
vercel

# 出力されるURLを確認
```

### 2. 本番デプロイ

```bash
# 本番環境へデプロイ
vercel --prod

# または、プレビューを本番に昇格
vercel promote <deployment-url>
```

### 3. デプロイ前チェックリスト

1. `pnpm lint` - Lintエラーがないこと
2. `pnpm test` - テストが通ること
3. `pnpm build` - ビルドが成功すること
4. 環境変数が設定済みであること

## 環境変数管理

### 環境変数の確認

```bash
# 全環境変数をリスト
vercel env ls

# 特定環境の変数を確認
vercel env ls production
vercel env ls preview
vercel env ls development
```

### 環境変数の追加

```bash
# インタラクティブに追加
vercel env add <NAME>

# 値を直接指定
echo "value" | vercel env add <NAME> production
```

## デプロイ状態の確認

```bash
# 最新デプロイ一覧
vercel ls

# デプロイ詳細
vercel inspect <deployment-url>

# ビルドログ確認
vercel logs <deployment-url>
```

## ロールバック

```bash
# 前のデプロイに戻す
vercel rollback

# 特定デプロイに戻す
vercel rollback <deployment-url>
```

## クイックコマンド一覧

| 目的 | コマンド |
|------|---------|
| プレビューデプロイ | `vercel` |
| 本番デプロイ | `vercel --prod` |
| デプロイ一覧 | `vercel ls` |
| ログ確認 | `vercel logs <url>` |
| 環境変数一覧 | `vercel env ls` |
| ロールバック | `vercel rollback` |

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| ビルドエラー | ローカルで確認 | `pnpm build` |
| 環境変数が反映されない | 再デプロイ必要 | `vercel --force` |
| Function timeout | 実行時間超過 | vercel.jsonで調整 |
