# Steering Reference（詳細）

## ディレクトリ命名
- パス: `.steering/<YYYYMMDD>-<slug>/`
- slug: 英小文字 + 数字 + `-`（例: `user-profile-edit`）
  - 日本語の機能名は、短い英語に要約してslug化する（例: ユーザープロフィール編集 → user-profile-edit）

## plan（作成）モードの詳細
1. `.steering/<YYYYMMDD>-<slug>/` を作成
2. 既存の永続ドキュメントがあれば読む（あるものだけでOK）
   - docs/product-requirements.md
   - docs/functional-design.md
   - docs/architecture.md
   - docs/repository-structure.md
   - docs/development-guidelines.md
3. テンプレから以下を作成
   - `templates/requirements.md` → `.steering/.../requirements.md`
   - `templates/design.md` → `.steering/.../design.md`
   - `templates/tasklist.md` → `.steering/.../tasklist.md`
4. `requirements.md` と `design.md` を踏まえて `tasklist.md` を「実装可能な粒度」まで具体化
   - 1タスク = 30〜90分で終わる粒度が目安
   - “検討” “調査” “あとで” は禁止（やるなら、その場で完了する調査だけをタスク化）

## implement（実装）モードの最重要ルール
- tasklist.md が正式な進捗。TodoWrite などの補助メモは“あっても良いが正ではない”
- **未完了（[ ]）を残したまま終了しない**
- **タスクをスキップしない**
  - 例外は「技術的理由で不要になった」場合のみ（下記）

### チェックボックス運用（おすすめ）
- `[ ]` = 未完了
- `[x]` = 完了
- 進行中を表したい場合は、チェックボックスは変えずに末尾に `(in progress)` を付ける  
  例: `- [ ] Fooを実装 (in progress)`
- 完了時に `(in progress)` を削除して `[x]` にする  
  例: `- [x] Fooを実装`

※ これで「開始/進行/完了」が tasklist.md 上で追えます。

### タスクが大きい場合（必ず分割）
- そのタスクを消さず、直下にサブタスクを追加して分割
- 先にサブタスクを完了させ、最後に親タスクを完了にする

### 技術的理由で不要になったタスク（唯一のスキップ許可）
- 許可される理由:
  - 実装方針変更で不要
  - アーキ変更で置き換え
  - 依存変更で実行不能
- 表記:
  - `- [x] ~~タスク名~~（不要: 具体的な技術的理由）`
- 置き換え先がある場合は、そのタスクを新規に追加する

## reflect（振り返り）モード
- 実行前に必ず tasklist を再読し、未完了 `[ ]` がゼロであることを確認
- 振り返り欄に以下を追記
  - 実装完了日
  - 計画と実績の差分（変更点と理由）
  - 学び
  - 次回改善

## 仕上げの自己チェック（必須）
- [ ] tasklist が最新（最後に更新してからタスクを進めていない）
- [ ] `[ ]` が残っていない（or 技術理由で正しくクローズされている）
- [ ] 設計変更があったなら design.md も追従している