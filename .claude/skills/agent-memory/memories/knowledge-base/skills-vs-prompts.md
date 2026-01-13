---
summary: "GitHub Copilot Skills vs Prompts の使い分けガイド - 設計思想、ベストプラクティス、判断基準をまとめた知見"
created: 2026-01-09
tags: [copilot, skills, prompts, best-practices]
related: [.github/SKILLS_VS_PROMPTS.md]
---

# Skills vs Prompts 使い分けの知見

## 核心的な違い

| 観点 | Skills | Prompts |
|------|--------|---------|
| **起動方法** | 会話中に自動判定で発火 | `/`コマンドで明示呼び出し |
| **設計思想** | 「オンボーディングガイド」- 専門エージェントに変換 | 「ショートカット」- 特定タスクへの入り口 |
| **構造** | フォルダ形式（SKILL.md + references/scripts/assets） | 単一ファイル |
| **入力** | 会話から取得 | `${input:...}`で明示入力 |

## Skills ベストプラクティス

1. **Concise is Key** - Claudeが既に知っていることは書かない
2. **Progressive Disclosure** - メタデータ→本体→参照の3段階読込
3. **SKILL.mdは500行以下** - 超えたらreferencesに分割
4. **参照は1階層まで** - 深いネストを避ける
5. **descriptionが最重要** - トリガーワード、ユースケースを網羅

## Prompts ベストプラクティス

1. **descriptionで「何をする/いつ使う」を明記**
2. **`${input:...}`で再利用可能にする**
3. **出力フォーマットを固定** - 毎回ブレない
4. **既存Skillを参照して重複排除**
5. **toolsは最小限**

## 使い分け判断基準

```
Q1: 複雑なワークフロー（3ステップ以上）or ドメイン知識が必要？
 ├─ Yes → Skill を作成
 └─ No ↓

Q2: 毎回同じ入力パラメータを求める？ or /コマンドで明示呼び出ししたい？
 ├─ Yes → Prompt を作成
 └─ No → copilot-instructions.md に追記で十分
```

## 推奨パターン

```
Skill（核となる知識・ワークフロー）
  │ 参照
  ▼
Prompt（入力テンプレート + Skill参照）
  │ /コマンドで起動
  ▼
ユーザー
```

**核となる知識はSkillに集約し、特定ユースケースへのショートカットとしてPromptを作成**する形が保守性が高い。

## 実例

- `x-buzz-post-generator/` (Skill) = 23パターン定義、作成ルール → 「バズりたい」で自動発火
- `x-buzz-post.prompt.md` (Prompt) = `${input:topic}` + Skill参照 → `/x-buzz-post`で起動

## 成果物

詳細ガイドを `.github/SKILLS_VS_PROMPTS.md` に作成済み。
