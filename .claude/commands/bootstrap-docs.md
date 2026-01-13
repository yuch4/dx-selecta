---
description: docs/ideasを元にPRD→各設計ドキュメントを初回生成する。PRDは承認ゲート付き。「ドキュメントを初期化」「プロジェクトのドキュメントを作成」「PRDから設計書まで作って」などの依頼時に使用。
argument-hint: product=プロダクト名
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Bootstrap Docs

docs/ideas を元に PRD→各設計ドキュメントを初回生成する（PRDは承認ゲート付き）。

## 入力
$ARGUMENTS（プロダクト名）

## 実行前の確認
1. `docs/ideas/` を確認
   - Markdownファイルが1つ以上ある → Step0へ
   - 空/存在しない → Step0'（対話で材料集め）へ

## Step0: インプットの読み込み
- docs/ideas/ 内の Markdown を全て読む
- 重要メモを作る（課題/ユーザー/価値/制約/未決定/用語）

## Step0'（ideasが無い場合）: 対話で材料を集める
次の質問に答えてもらう：
1. 誰の、どんな痛み？
2. それをどう解決する？
3. 何ができれば成功？
4. 今回はやらないことは？
5. 制約（納期/予算/技術/法務/セキュリティ）

## Step1: PRD作成（承認ゲート）
- **prd-writing スキル**に従って `docs/product-requirements.md` を作成
- 作成後、ユーザーに承認を求める：

  「PRD案を作成しました。
   ✅ 承認する場合は『承認』と返信してください。
   ✏️ 修正する場合は『修正: …』で指示してください。」

- **ユーザーの返信が『承認』でない限り Step2以降に進まない。**

## Step2〜6（承認後に自動実行）

### Step2: 機能設計書
- **functional-design スキル**で `docs/functional-design.md` を作成

### Step3: アーキテクチャ設計書
- **architecture-design スキル**で `docs/architecture.md` を作成

### Step4: リポジトリ構造定義書
- **repository-structure スキル**で `docs/repository-structure.md` を作成

### Step5: 開発ガイドライン
- **development-guidelines スキル**で `docs/development-guidelines.md` を作成

### Step6: 用語集
- **glossary-creation スキル**で `docs/glossary.md` を作成

## 完了条件
次の6ファイルが存在し、内容が空でないこと：
- docs/product-requirements.md
- docs/functional-design.md
- docs/architecture.md
- docs/repository-structure.md
- docs/development-guidelines.md
- docs/glossary.md

## 完了時の出力

```
初回セットアップが完了しました!

作成したドキュメント:
✅ docs/product-requirements.md
✅ docs/functional-design.md
✅ docs/architecture.md
✅ docs/repository-structure.md
✅ docs/development-guidelines.md
✅ docs/glossary.md

今後の使い方:
- 機能の追加: /add-feature [機能名]
- ドキュメントレビュー: /review-core-docs
```
