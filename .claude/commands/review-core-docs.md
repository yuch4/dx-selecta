---
description: 6つの永続ドキュメント（PRD/機能設計/アーキテクチャ/リポジトリ構造/開発ガイドライン/用語集）を個別レビュー＋横断整合チェックして、優先修正リストを作る。
allowed-tools: Read, Glob, Grep
---

# Review Core Docs

6つの永続ドキュメントをレビューし、曖昧さ・矛盾・抜け漏れを洗い出す。

## 対象（6つ）
- docs/product-requirements.md
- docs/functional-design.md
- docs/architecture.md
- docs/repository-structure.md
- docs/development-guidelines.md
- docs/glossary.md

## 実行手順

### 1) 存在確認
上記6ファイルの存在を確認し、
- 存在する: レビュー対象
- 無い: 「未作成」として記録

### 2) 個別レビュー（各ドキュメント）

共通観点:
- 完全性: 必要な章/要素が揃っているか
- 具体性: 実装/運用に落ちる粒度か
- 一貫性: 他ドキュメントや実コードと矛盾しないか
- 検証可能性: 受け入れ条件や成功指標が測れるか

### 3) 横断整合チェック
以下の"ズレ"を洗い出す：
- PRD ↔ Functional Design: 機能/受け入れ条件のズレ
- Functional Design ↔ Architecture: 責務分割/依存方向のズレ
- Architecture ↔ Repo Structure: レイヤー構造とディレクトリのズレ
- Development Guidelines ↔ 実コード: 規約が守られているか
- Glossary ↔ 全部: 用語定義が一致しているか

## 出力フォーマット

```markdown
# Core Docs Review

## 未作成
- (あれば列挙)

## 個別レビュー要約
- product-requirements.md: 評価(1-5) / 最重要改善点: ...
- functional-design.md: ...
- architecture.md: ...
- repository-structure.md: ...
- development-guidelines.md: ...
- glossary.md: ...

## 横断で直すべき優先課題（上位）
1. ...（優先度: 高）/ 影響: ... / 修正先: ...
2. ...
3. ...

## 次のアクション（tasklist化できる粒度）
- [ ] ...
- [ ] ...
```
