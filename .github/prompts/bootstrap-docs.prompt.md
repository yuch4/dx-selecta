---
name: bootstrap-docs
description: docs/ideas を元に PRD→各設計ドキュメントを初回生成する（PRDは承認ゲート）
argument-hint: "例: product=卸向け業務改善SaaS"
agent: product-docs-orchestrator
tools: ["read", "search", "edit", "execute"]
---

対象プロダクト: ${input:product:プロダクト名}

# 実行前の確認（必ず実行）
1) `docs/ideas/` を確認する（ターミナルで実行）
   - `ls docs/ideas/`
2) 判定:
   - Markdownファイルが1つ以上ある → Step0へ
   - 空/存在しない → Step0'（対話で材料集め）へ

---

## Step0: インプットの読み込み
- docs/ideas/ 内の Markdown を全て読む
- 重要メモを作る（課題/ユーザー/価値/制約/未決定/用語）

## Step0'（ideasが無い場合）: 対話で材料を集める
次の質問に「短文で」答えてもらい、回答を元にStep1を作る：
1) 誰の、どんな痛み？
2) それをどう解決する？
3) 何ができれば成功？
4) 逆に今回はやらないことは？
5) 制約（納期/予算/技術/法務/セキュリティ）

---

## Step1: PRD作成（承認ゲート）
- **prd-writing スキル**に従って `docs/product-requirements.md` を作成/更新する
- 作成後、ユーザーに承認を求める（次の文言を必ず出す）：

  「PRD案を作成しました。  
   ✅ 承認する場合は『承認』と返信してください。  
   ✏️ 修正する場合は『修正: …』で指示してください。  
   ❓ 追加要件があれば『追加: …』で書いてください。」

- **ユーザーの返信が『承認』でない限り Step2以降に進まない。**

---

## Step2〜6（承認後に自動実行）
ユーザーが『承認』と返信したら、以下を順に実行して docs/ を作成/更新する：

## Step2: 機能設計書
- **functional-design スキル**に従って `docs/functional-design.md` を作成/更新

## Step3: アーキテクチャ設計書
- **architecture-design スキル**に従って `docs/architecture.md` を作成/更新

## Step4: リポジトリ構造定義書
- **repository-structure スキル**に従って `docs/repository-structure.md` を作成/更新

## Step5: 開発ガイドライン
- **development-guidelines スキル**に従って `docs/development-guidelines.md` を作成/更新

## Step6: 用語集
- **glossary-creation スキル**に従って `docs/glossary.md` を作成/更新

---

## 完了条件
- 次の6ファイルが存在し、内容が空でないこと：
  - docs/product-requirements.md
  - docs/functional-design.md
  - docs/architecture.md
  - docs/repository-structure.md
  - docs/development-guidelines.md
  - docs/glossary.md

完了時は必ずこの形式で出力：
「初回セットアップが完了しました!

作成したドキュメント:
✅ docs/product-requirements.md
✅ docs/functional-design.md
✅ docs/architecture.md
✅ docs/repository-structure.md
✅ docs/development-guidelines.md
✅ docs/glossary.md

今後の使い方:
- ドキュメントの編集: 普通に会話で依頼
- 機能の追加: /add-feature [機能名]
- ドキュメントレビュー: /review-docs [パス]」
