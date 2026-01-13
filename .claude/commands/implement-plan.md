---
description: PRD/設計ドキュメントを網羅的に確認し、未実装機能を洗い出して実装計画を立てる（steering planモード）。実装は行わず計画だけを作成。
argument-hint: [スコープ] 例) サービスレイヤー全体 / 通知機能 / 全体
allowed-tools: Read, Glob, Grep
---

# Implement Plan (steering plan mode)

リポジトリの実装状況を把握し、設計ドキュメントとの差分から実装計画を立てる。
計画作成モードで、実装は行わない。

## 入力
$ARGUMENTS（スコープ、任意）

## 参照
- steering スキル: `.claude/skills/steering/SKILL.md`
- 設計ドキュメント:
  - `docs/product-requirements.md`
  - `docs/functional-design.md`
  - `docs/architecture.md`
  - `docs/repository-structure.md`

## 実行手順

### 1) 設計ドキュメント確認
以下を網羅的に読み取る：
- PRDの機能要件（受け入れ条件含む）
- 機能設計のコンポーネント一覧
- リポジトリ構造の期待ファイル一覧

### 2) 現在の実装状況確認
- `src/services/` - サービスファイルの存在
- `src/repositories/` - リポジトリファイルの存在
- `src/app/api/` - APIルートの存在
- `src/components/` - UIコンポーネントの存在
- `tests/` - テストの存在

### 3) GAP分析
設計に定義されているが実装されていない機能を列挙

### 4) 実装計画の作成

## 出力フォーマット

```markdown
# 実装計画

## 実装状況サマリー
| カテゴリ | 設計上の数 | 実装済み | 未実装 |
|---------|-----------|---------|--------|
| サービス | X | Y | Z |
| リポジトリ | X | Y | Z |
| APIルート | X | Y | Z |

## 未実装機能一覧

### 優先度: 高（依存関係の起点）
1. **機能名**: 概要
   - 必要なファイル: `src/...`
   - 依存先: なし / 機能名
   - 推定工数: X時間

### 優先度: 中
...

### 優先度: 低
...

## 推奨実装順序
1. {機能名} - 理由
2. {機能名} - 理由

## 次のアクション
`/implement-feature` で以下を順次実装:
- [ ] {機能名1}
- [ ] {機能名2}
```
