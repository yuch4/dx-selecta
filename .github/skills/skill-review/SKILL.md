---
name: skill-review
description: .github/skills 配下の Agent Skills（各SKILL.md）をレビューして改善提案を出す。name/description妥当性、簡潔さ、progressive disclosure、例の有無、参照の深さ、ツール制限、500行制限などのベストプラクティス観点でチェックする。新規作成/改修時に使う。
---

# Skill Review Skill

このスキルは、あなた（ユーザー）が作った Agent Skills を「使われる/壊れない/育てやすい」状態に整えるためのレビュー手順です。

## When to use
- 新しい Skill を追加した直後
- 既存 Skill の description が効かない（発火しない）と感じたとき
- SKILL.md が肥大化してきたとき（分割したいとき）
- “他のSkillと被る/衝突する” 感じがするとき

## Inputs
- 対象パス（例: `.github/skills/prd-writing/`）または
- `.github/skills/` 配下の全スキル

## Output (必ずこの形式)
`docs/skill-review-report.md` を作成/更新し、次の構成で出力する:

1. Summary（全体所見 + 優先度P0/P1/P2の件数）
2. Skill-by-skill findings（各Skillごとに）
   - P0: 壊れている/読み込まれない/誤動作しうる
   - P1: 使われにくい/品質が揺れる
   - P2: 改善余地（読みやすさ/保守性）
3. Recommended edits（具体的な修正案。必要なら差分形式）

## Review checklist（必須観点）
### A. Metadata/format correctness
- `name` は小文字・数字・ハイフンのみ、ディレクトリ名と一致（推奨）
- `description` は「何ができる/いつ使う」を具体的に（スキル選択に使われる）
- SKILL.md は過剰に長くない（目安: 500行以内）

### B. Discoverability（発火しやすさ）
- description に “ユーザーが言いそうな言葉” が入っている（例: PRD/要件定義/受け入れ条件 など）
- 「他スキルと差別化できる境界（やらないこと）」が明確

### C. Conciseness & progressive disclosure
- SKILL.md は「手順の骨格」と「最低限の例」だけ
- 詳細テンプレ/長い例は `reference.md` 等に退避し、SKILL.md からリンク
- 参照は 1段で止める（SKILL.md → reference.md のように直リンク）

### D. Procedural clarity
- 手順が番号付きで、入力→処理→出力が明確
- 出力フォーマットが固定されている（レビュー結果がブレない）

### E. Safety/tooling assumptions
- 破壊的操作が必要か？必要なら明示し、原則 read-only を推奨
- スクリプトがあるなら「読まずに実行」して結果だけ使う

## Procedure
1) `.github/skills/` を列挙し、対象Skillディレクトリを特定  
2) 各 `SKILL.md` を読み、チェックリストA〜Eで評価  
3) 可能なら `scripts/validate_skill.py` を実行し、機械チェック結果も取り込む  
4) `docs/skill-review-report.md` を更新して提示  
5) ユーザーが「修正して」と言った場合のみ、該当SKILLを直す（勝手に改変しない）

## Examples
- 「.github/skills のSkillを全部レビューして」
- 「prd-writing の description が発火しない。改善して」
- 「このSkill、肥大化してきたので progressive disclosure に分割して」
