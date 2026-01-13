---
description: PRD/機能設計から該当機能を特定し、steering駆動で「計画→実装→検証→振り返り」を完全完走する。途中でユーザー確認を挟まず最後まで完走する完全実行モード。
argument-hint: 機能名 [追加メモ] 例) ダイジェスト生成サービス
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Implement Feature (steering-driven)

設計書に基づき安全に機能を実装する。完全実行モードで最後まで完走する。

## 入力
$1 = 機能名（例: ダイジェスト生成サービス）
$2 = 追加メモ（任意）

## 参照
- steering スキル: `.claude/skills/steering/SKILL.md`
- 設計ドキュメント:
  - `docs/product-requirements.md`
  - `docs/functional-design.md`
  - `docs/architecture.md`
  - `docs/repository-structure.md`
  - `docs/development-guidelines.md`

## 実行手順

### 0) 設計ドキュメント確認
1. `docs/` 配下の設計ドキュメントをすべて読む
2. 入力された機能名に対応する機能要件・設計を特定
3. 対応が見つからない場合は、既存パターンから推測して進める

### 1) ステアリング作成（計画）
- 日付: 今日を `YYYYMMDD`
- slug: 機能名を短い英語・kebab-case に正規化
- パス: `.steering/YYYYMMDD-slug/`

作成するファイル:
- `.steering/YYYYMMDD-slug/requirements.md`
- `.steering/YYYYMMDD-slug/design.md`
- `.steering/YYYYMMDD-slug/tasklist.md`

### 2) 実装ループ（tasklist完全消化）
`tasklist.md` の `[ ]` がゼロになるまで繰り返す：

1. tasklist.md を読む
2. 先頭の未完了タスク（`[ ]`）を1つ選ぶ
3. 既存パターンを確認（同種のファイルがあれば参考に）
4. 実装
5. 完了したら tasklist の該当項目を `[x]` に更新
6. 次の未完了タスクへ

### 3) 検証
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
エラーがあれば直して再実行。

### 4) 仕上げ（振り返り）
tasklist.md の最下部「振り返り」を埋める：
- 実装完了日
- 計画との差分
- 学び / 次回改善

### 5) 最終出力
- 作成した steering パス
- 変更した主要ファイル一覧
- 受け入れ条件に対する自己チェック結果
