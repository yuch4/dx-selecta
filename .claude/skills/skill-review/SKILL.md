---
name: skill-review
description: .claude/skills 配下のスキル（各SKILL.md）をレビューして改善提案を出す。name/description妥当性、簡潔さ、progressive disclosure、例の有無、参照の深さ、ツール制限、500行制限などのベストプラクティス観点でチェック。「スキルをレビューして」「skill改善」「スキルを見直して」などの依頼時に使用。
allowed-tools: Read, Glob, Grep
user-invocable: true
---

# Skill Review Skill

作成したスキルを「使われる/壊れない/育てやすい」状態に整えるためのレビュー。

## いつ使う
- 新しいスキルを追加した直後
- descriptionが効かない（発火しない）と感じたとき
- SKILL.mdが肥大化してきたとき
- 他のスキルと被る/衝突する感じがするとき

## 入力
- 対象パス（例: `.claude/skills/prd-writing/`）または
- `.claude/skills/` 配下の全スキル

## 出力
レビュー結果を以下の形式で提示：

1. Summary（全体所見 + 優先度P0/P1/P2の件数）
2. Skill-by-skill findings（各Skillごと）
   - P0: 壊れている/読み込まれない/誤動作しうる
   - P1: 使われにくい/品質が揺れる
   - P2: 改善余地（読みやすさ/保守性）
3. Recommended edits（具体的な修正案）

## レビューチェックリスト

### A. Metadata/format correctness
- [ ] `name` は小文字・数字・ハイフンのみ
- [ ] `description` は「何ができる/いつ使う」を具体的に
- [ ] SKILL.md は500行以内

### B. Discoverability（発火しやすさ）
- [ ] descriptionに「ユーザーが言いそうな言葉」が入っている
- [ ] 他スキルと差別化できる境界（やらないこと）が明確

### C. Conciseness & progressive disclosure
- [ ] SKILL.mdは「手順の骨格」と「最低限の例」だけ
- [ ] 詳細テンプレ/長い例は `references/` に退避
- [ ] 参照は1段で止める

### D. Procedural clarity
- [ ] 手順が番号付きで、入力→処理→出力が明確
- [ ] 出力フォーマットが固定されている

### E. Safety/tooling
- [ ] allowed-toolsが適切に設定されている
- [ ] 破壊的操作があれば明示されている

## 手順

1. `.claude/skills/` を列挙し、対象スキルを特定
2. 各 `SKILL.md` を読み、チェックリストA〜Eで評価
3. 結果を整理して提示
4. ユーザーが「修正して」と言った場合のみ、該当スキルを修正

## 例
- 「.claude/skills のスキルを全部レビューして」
- 「prd-writingのdescriptionが発火しない。改善して」
- 「このスキル、肥大化してきたので分割して」
