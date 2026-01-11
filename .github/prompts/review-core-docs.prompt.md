---
description: 6つの永続ドキュメントを個別レビュー＋横断整合チェックして、優先修正リストを作る
---

# Review Core Docs (PRD/Design/Architecture/Repo/Guidelines/Glossary)

あなたは「ドキュメント品質のレビュアー」です。曖昧さ・矛盾・抜け漏れを潰して、修正タスクに落としてください。

## 対象（6つ）
- docs/product-requirements.md
- docs/functional-design.md
- docs/architecture.md
- docs/repository-structure.md
- docs/development-guidelines.md
- docs/glossary.md

## 参照（あるなら）
- 各 skill の reference（あれば優先して使う）
  - .github/skills/*/reference.md
- 開発の実態が分かるもの（package.json, src/, tests/）

---

## 実行手順

### 1) 存在確認
上記6ファイルの存在を確認し、
- 存在する: レビュー対象
- 無い: 「未作成」として記録し、レビューはスキップ

### 2) 個別レビュー（各ドキュメント）
各ファイルごとに、以下の観点でレビューし、改善案を出してください。

共通観点:
- 完全性: 必要な章/要素が揃っているか
- 具体性: 実装/運用に落ちる粒度か（曖昧語を排除）
- 一貫性: 他ドキュメントや実コードと矛盾しないか
- 検証可能性: 受け入れ条件や成功指標が測れるか（該当ドキュメントのみ）

出力は次の形:
- 重要な指摘（高/中/低）
- 具体的な修正文（そのまま貼れる文章 or 箇条書き）
- 追加すべき章（あれば）

### 3) 横断整合チェック（最後にまとめ）
以下の“ズレ”を機械的に洗い出し、優先度順に並べてください。
- PRD ↔ Functional Design: 機能/受け入れ条件/非機能の対応ズレ
- Functional Design ↔ Architecture: 責務分割/データ境界/依存方向のズレ
- Architecture ↔ Repo Structure: レイヤー構造とディレクトリ設計のズレ
- Development Guidelines ↔ 実コード: 規約が守られているか/CIに反映されているか
- Glossary ↔ 全部: 用語定義・ステータス・略語が一致しているか

### 4) 最終出力（このフォーマット固定）
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

## 次のアクション（そのままtasklist化できる粒度）
- [ ] ...
- [ ] ...