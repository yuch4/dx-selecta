---
summary: "Claude Code公式仕様 - Skills/Commands/settings.jsonのフロントマター形式と設定方法"
created: 2026-01-13
tags: [claude-code, skills, commands, specification]
related: [.claude/rules/skills-vs-commands.md]
---

# Claude Code 公式仕様

GitHub Copilot形式からClaude Code形式への移行時に調査した公式仕様。

## Skills (SKILL.md) フロントマター

```yaml
---
name: skill-name                    # 必須。英小文字・数字・ハイフン（最大64文字）
description: 何をする / いつ使う     # 必須。最大1024文字
allowed-tools: Read, Grep, Glob     # オプション。使用ツールを制限
model: claude-sonnet-4-20250514     # オプション。使用モデル指定
user-invocable: true                # オプション。スラッシュメニュー表示（デフォルト: true）
---
```

## Commands フロントマター

```yaml
---
description: 何をする / いつ使う               # 必須
allowed-tools: Read, Grep, Glob              # オプション。使用ツールを制限
argument-hint: [pr-number] [priority]        # オプション。引数ヒント表示
model: claude-sonnet-4-20250514              # オプション。使用モデル
---
```

### 変数の使い方

```markdown
$ARGUMENTS        # 全引数（"/command arg1 arg2" → "arg1 arg2"）
$1, $2, $3, ...   # 個別引数
```

## allowed-tools の指定方法

| パターン | 説明 | 例 |
|---------|------|-----|
| ツール名 | 完全許可 | `Read`, `Grep`, `Glob`, `Write`, `Edit`, `Bash` |
| ツール+パターン | プレフィックス指定（Bashのみ） | `Bash(npm run:*)`, `Bash(git add:*)` |
| 複数指定 | コンマ区切り | `Read, Grep, Glob` |

**重要**: パターンマッチングは正規表現ではなくプレフィックス一致。`*`は「残り全部」を意味する。

## settings.json 形式

```json
{
  "permissions": {
    "allow": ["Bash(npm run:*)", "Read(~/.zshrc)"],
    "ask": ["Bash(git push:*)"],
    "deny": ["Read(./.env)", "Read(./secrets/**)"]
  },
  "env": {
    "NODE_ENV": "development"
  },
  "language": "Japanese",
  "model": "claude-sonnet-4-20250514"
}
```

## Rules ファイル (.claude/rules/)

```yaml
---
paths:                              # オプション。glob パターンで条件付けルール
  - "src/**/*.ts"
  - "tests/**/*.test.ts"
---

# ルールの内容
```

## GitHub Copilot → Claude Code 移行マッピング

| GitHub Copilot | Claude Code |
|----------------|-------------|
| `.github/copilot-instructions.md` | `.claude/CLAUDE.md` |
| `.github/prompts/*.prompt.md` | `.claude/commands/*.md` |
| `.github/skills/*/SKILL.md` | `.claude/skills/*/SKILL.md` |
| `.github/agents/*.agent.md` | `.claude/skills/*/SKILL.md` |
| `tools: [read, search]` | `allowed-tools: Read, Grep, Glob` |
| `${input:name:hint}` | `$ARGUMENTS` |

## 2026-01-13 修正内容

- `skills-vs-commands.md` を公式仕様に更新
- `job-application-writer/SKILL.md` に `user-invocable: true` を追加
- `job-application-pr.md` に `argument-hint` を追加
