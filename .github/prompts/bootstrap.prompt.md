---
name: bootstrap
description: "ユーザーの要望から最適なスキル・エージェント・プロンプトを組み合わせて実現するオーケストレーター"
argument-hint: "例: ASMレポートを作りたい / ブログを書きたい / 新しいスキルを作りたい"
agent: agent
tools: ['read', 'search', 'agent']
---

# Bootstrap プロンプト

ユーザーの要望を分析し、既存資産を最大限活用した実現プランを提案します。

## 入力

要望: ${input:request:何を実現したいですか？}

---

## 処理手順

### Step 1: 要望の分解
- 要望を具体的なタスク・成果物に分解
- 必要な機能・技術要件を特定

### Step 2: 既存資産のスキャン
以下をスキャンして活用可能な資産を探す:
- `.github/skills/*/SKILL.md` - スキルの description を確認
- `.github/agents/*.agent.md` - エージェントの専門領域を確認  
- `.github/prompts/*.prompt.md` - プロンプトの用途を確認

### Step 3: マッチング結果を提示
ユーザーに以下を提示:

| 種類 | 名前 | 用途 | マッチ度 |
|------|------|------|---------|
| skill/agent/prompt | 名前 | 説明 | ⭐⭐⭐ |

新規作成が必要な場合:

| 種類 | 提案名 | 理由 |
|------|--------|------|
| skill/agent/prompt | 名前 | なぜ必要か |

### Step 4: アクションプラン提示
1. ステップ1: ...
2. ステップ2: ...
3. ステップ3: ...

### Step 5: 実行（承認後）
- 既存スキルを読み込んで指示に従う
- 新規作成時は [skill-creator](../skills/skill-creator/SKILL.md) を参照
- 複雑なタスクは専門エージェントへ委譲

---

## 出力フォーマット

```
## 🔍 要望の理解
（分解結果）

## 📊 資産マッチング
（既存資産・新規作成の表）

## 🚀 アクションプラン
（ステップ）

## ❓ 確認事項
（あれば）
```

---

## 制約
- 既存資産を最大限活用（車輪の再発明を避ける）
- 新規作成時は [skill-creator](../skills/skill-creator/SKILL.md), [prompt-review](../skills/prompt-review/SKILL.md) に従う
