---
description: .claude/commands/*.mdをレビューして改善提案を出す。frontmatterの妥当性、出力フォーマット固定、skills/rulesへの参照（重複排除）、例の有無などをチェック。
allowed-tools: Read, Glob, Grep
---

# Prompt Review Command

## 目的
Claude Code用コマンドファイル（`.claude/commands/*.md`）をレビューし、改善提案を行う。

## 入力
$ARGUMENTS（対象パスまたは空で全件）

## 出力（固定フォーマット）

```markdown
# コマンドレビュー結果

## Summary
- 対象: N件
- P0（致命的）: N件
- P1（改善必須）: N件
- P2（推奨）: N件

## 詳細

### [コマンド名]

**評価**:
- P0/P1/P2: [問題点] → [推奨修正]

**強み**:
- [良い点]
```

## レビュー観点

### A. Frontmatter
- [ ] descriptionが「何をする/いつ使う」を明記
- [ ] allowed-toolsが適切（過剰権限でない）
- [ ] argument-hintで引数を説明（引数がある場合）

### B. 構造
- [ ] 出力フォーマットが固定されている
- [ ] 手順が明確

### C. 重複排除
- [ ] ルール/規約はskillsやrulesを参照
- [ ] コピペしていない

### D. 例
- [ ] 使用例がある

## 手順

1. `$ARGUMENTS` で対象を特定（空なら`.claude/commands/`全体）
2. 各コマンドファイルを読み、A〜Dで評価
3. 結果を整理して提示
4. ユーザーが「修正して」と言った場合のみ修正
