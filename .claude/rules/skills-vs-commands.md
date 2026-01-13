# Skills vs Commands 使い分けガイド

Claude Codeの**Skills**と**Commands**は両方ともClaudeの機能を拡張するが、設計思想と用途が異なる。

---

## 概要比較

| 項目 | Skills | Commands |
|------|--------|----------|
| **格納場所** | `.claude/skills/<name>/SKILL.md` | `.claude/commands/<name>.md` |
| **構造** | フォルダ形式（SKILL.md + references/） | 単一ファイル |
| **起動方法** | 会話中に**自動判定**で発火、または `/skill-name` | `/command-name` で**明示的**に呼び出し |
| **設計思想** | 専門エージェント化 - ドメイン知識をカプセル化 | ショートカット - 特定タスクへの入り口 |
| **入力** | 会話から取得 | `$ARGUMENTS`で明示的に入力 |

---

## Skills の特徴

### いつ使うか

- 複雑なワークフロー（3ステップ以上）
- ドメイン固有の知識やテンプレートが必要
- 「〇〇したい」と言うだけで自動発火させたい
- 参照ドキュメントを同梱したい

### 構造

```
skill-name/
├── SKILL.md (必須)
│   ├── YAML frontmatter
│   └── Markdown本体（ワークフロー、ルール）
└── references/      # 参照ドキュメント（オプション）
```

### SKILL.md フロントマター（公式形式）

```yaml
---
name: skill-name                    # 必須。英小文字・数字・ハイフン（最大64文字）
description: 何をする / いつ使う     # 必須。最大1024文字
allowed-tools: Read, Grep, Glob     # オプション。使用ツールを制限
model: claude-sonnet-4-20250514     # オプション。使用モデル指定
user-invocable: true                # オプション。スラッシュメニュー表示（デフォルト: true）
---
```

### allowed-tools の指定方法

| パターン | 説明 | 例 |
|---------|------|-----|
| ツール名 | 完全許可 | `Read`, `Grep`, `Glob`, `Write`, `Edit`, `Bash` |
| ツール+パターン | プレフィックス指定（Bashのみ） | `Bash(npm run:*)`, `Bash(git add:*)` |
| 複数指定 | コンマ区切り | `Read, Grep, Glob` |

### ベストプラクティス

1. **Concise is Key** - コンテキストウィンドウは共有資源
2. **Progressive Disclosure** - 3段階で読み込み
   - メタデータ → 常に読込
   - SKILL.md本体 → スキル発火時
   - 参照ファイル → 必要時のみ
3. **SKILL.mdは500行以下** - 超えたらreferencesに分割
4. **参照は1階層まで** - 深いネストを避ける
5. **descriptionが重要** - トリガーワード、ユースケースを網羅

---

## Commands の特徴

### いつ使うか

- `/`コマンドで明確に呼び出したい
- 毎回同じ入力項目を求めるタスク
- 既存スキルへのショートカットを作りたい
- 出力フォーマットを厳密に固定したい

### コマンドファイル形式（公式形式）

```markdown
---
description: 何をする / いつ使う               # 必須
allowed-tools: Read, Grep, Glob              # オプション。使用ツールを制限
argument-hint: [pr-number] [priority]        # オプション。引数ヒント表示
model: claude-sonnet-4-20250514              # オプション。使用モデル
---

# タイトル

## 参照
- 関連スキル: `.claude/skills/xxx/SKILL.md`

## 実行手順
1. ...
2. ...

## 出力フォーマット
（固定形式で定義）
```

### 引数の使い方

```markdown
# 全引数を取得
/my-command arg1 arg2 arg3
# $ARGUMENTS は "arg1 arg2 arg3" になる

# 個別引数を取得
/review-pr 456 high alice
# $1="456", $2="high", $3="alice"
```

### ベストプラクティス

1. **description重視** - 何をする/いつ使うを明確に
2. **引数の設計** - `argument-hint`で期待値を説明
3. **出力フォーマット固定** - 章立て/表/チェックリストで毎回ブレない
4. **重複排除** - ルールはskillsに寄せ、commandにコピペしない
5. **allowed-tools最小化** - 必要なものだけ

---

## 使い分けの判断フロー

```
Q1: 複雑なワークフロー（3ステップ以上）or ドメイン知識が必要？
 ├─ Yes → Skill を作成
 └─ No ↓

Q2: 毎回同じ入力パラメータを求める？ or /コマンドで明示呼び出ししたい？
 ├─ Yes → Command を作成
 └─ No → CLAUDE.md に追記で十分かも
```

---

## 推奨パターン

```
【核となる知識・ワークフロー】
     │
     ▼
   Skill（SKILL.md + references/）
     │
     │ 参照
     ▼
   Command（入力テンプレート + Skill参照）
     │
     │ /コマンドで起動
     ▼
   ユーザー
```

**核となる知識はSkillに集約し、特定ユースケースへのショートカットとしてCommandを作成**する形が保守性が高い。

---

## チェックリスト

### Skill作成時

- [ ] descriptionにトリガーワードを網羅したか
- [ ] SKILL.mdは500行以下か
- [ ] 詳細情報はreferencesに分離したか
- [ ] 参照は1階層までか
- [ ] allowed-toolsを適切に設定したか

### Command作成時

- [ ] descriptionで「何をする/いつ使う」を明記したか
- [ ] argument-hintで引数を説明したか
- [ ] 出力フォーマットを固定したか
- [ ] 既存Skillを参照して重複を排除したか
- [ ] allowed-toolsは最小限か
