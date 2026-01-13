---
description: 既存の.steeringディレクトリを読み込み、未完了タスクから実装を再開する。途中でユーザー確認を挟まず最後まで完走する完全実行モード。
argument-hint: steeringパス 例) .steering/20260101-digest-service
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Implement Continue (steering implement mode)

既存のsteering計画を引き継いで実装を完走させる。
完全実行モードで最後まで完走する。

## 入力
$ARGUMENTS（steeringパス）

## 参照
- steering スキル: `.claude/skills/steering/SKILL.md`

## 実行手順

### 1) steering読み込み
指定されたsteeringパスから以下を読み込む：
- `requirements.md` - 要求内容と受け入れ条件
- `design.md` - 設計方針
- `tasklist.md` - タスク一覧と進捗状況

### 2) 進捗確認
`tasklist.md` の状態を確認：
- 完了済みタスク数 (`[x]`)
- 未完了タスク数 (`[ ]`)

### 3) 実装ループ（tasklist完全消化）
`[ ]` がゼロになるまで繰り返す：

1. tasklist.md を読む
2. 先頭の未完了タスク（`[ ]`）を1つ選ぶ
3. 既存パターンを確認
4. 実装
5. 完了したら `[x]` に更新
6. 次の未完了タスクへ

### 4) 検証
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### 5) 仕上げ（振り返り）
tasklist.md の最下部「振り返り」を埋める

### 6) 最終出力
- 引き継いだ steering パス
- 今回消化したタスク数
- 変更した主要ファイル一覧
- 受け入れ条件に対する自己チェック結果
