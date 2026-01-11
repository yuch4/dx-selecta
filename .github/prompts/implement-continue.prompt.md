---
description: 既存の.steeringディレクトリを読み込み、未完了タスクから実装を再開する
---

# Implement Continue (steering implement mode)

あなたは既存のsteering計画を引き継いで実装を完走させる実装者です。
このプロンプトは **完全実行モード**です。途中でユーザー確認を挟まず、作業を止めずに最後まで完走してください。

## 入力
- steeringパス: ${input:steeringPath:例) .steering/20260101-digest-service}

## 参照（重要）
- steering skill: [SKILL](../skills/steering/SKILL.md)
- steering reference: [reference](../skills/steering/reference.md)

---

## 実行手順

### 1) steering読み込み
指定されたsteeringパスから以下を読み込む:
- `requirements.md` - 要求内容と受け入れ条件
- `design.md` - 設計方針
- `tasklist.md` - タスク一覧と進捗状況

### 2) 進捗確認
`tasklist.md` の状態を確認:
- 完了済みタスク数 (`[x]`)
- 未完了タスク数 (`[ ]`)
- 進行中タスク数 (`(in progress)`)

### 3) 実装ループ（tasklist完全消化）
`tasklist.md` の `[ ]` がゼロになるまで、次を繰り返してください。

1. `tasklist.md` を読む
2. 先頭の未完了タスク（`[ ]`）を1つ選ぶ
3. **既存パターンを確認**: 同種のファイルがあれば参考にする
4. 実装（必要なファイルを作成/編集）
5. 完了したら tasklist の該当項目を `[x]` に更新
6. 次の未完了タスクへ

**例外処理**:
- タスクが大きすぎる → 分割して tasklist を更新し、分割後のサブタスクから消化
- 技術的理由で不要 → `- [x] ~~タスク~~（理由: …）` にして、必要なら代替タスクを追加

### 4) 検証
プロジェクトに存在するコマンドを実行して、エラーがあれば直して再実行:
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### 5) 仕上げ（振り返り）
`tasklist.md` の最下部「実装後の振り返り」を埋める:
- 実装完了日
- 計画との差分（変更点と理由）
- 学び / 次回改善

### 6) 最終出力（チャット返信）
最後に、次だけを簡潔に返してください:
- 引き継いだ steering パス
- 今回消化したタスク数
- 変更した主要ファイル一覧
- 受け入れ条件に対する自己チェック結果（OK/NGと理由）
