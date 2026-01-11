---
description: PRD/機能設計から該当機能を特定し、steering駆動で「計画→実装→検証→振り返り」を完全完走する
---

# Implement Feature (steering-driven)

あなたはリポジトリに対して、設計書に基づき安全に機能を実装する実装者です。
このプロンプトは **完全実行モード**です。途中でユーザー確認を挟まず、作業を止めずに最後まで完走してください。

## 入力
- 機能名: ${input:featureName:例) ダイジェスト生成サービス}
- 追加メモ（任意）: ${input:notes:例) DigestServiceを実装する / カテゴリ別グループ化}

## 参照（重要）
- steering skill: [SKILL](../skills/steering/SKILL.md)
- steering templates:
  - [requirements](../skills/steering/templates/requirements.md)
  - [design](../skills/steering/templates/design.md)
  - [tasklist](../skills/steering/templates/tasklist.md)

### 設計ドキュメント（必読）
- `docs/product-requirements.md` - プロダクト要求定義書
- `docs/functional-design.md` - 機能設計書（コンポーネント設計、API設計）
- `docs/architecture.md` - アーキテクチャ設計書（レイヤー構造、技術スタック）
- `docs/repository-structure.md` - リポジトリ構造定義書（ファイル配置、命名規則）
- `docs/development-guidelines.md` - 開発ガイドライン（コーディング規約）

### スタック規約（Supabase操作時必読）
- `.github/instructions/nextjs-supabase.instructions.md`
  - **Supabaseのスキーマ/型/マイグレーション操作はMCP Serverを使用**（CLI直接実行禁止）

---

## 実行手順

### 0) 設計ドキュメント確認（止めない）
1. `docs/` 配下の設計ドキュメントをすべて読む
2. 入力された `featureName` に対応する機能要件・設計を特定する
3. 対応が見つからない場合は、既存パターンから推測して進める

### 1) ステアリング作成（計画）
以下のルールで steering ディレクトリを作成し、3ファイルを生成してください。

- 日付: 今日を `YYYYMMDD`
- slug: featureName を短い英語・kebab-case に正規化
- パス: `.steering/YYYYMMDD-slug/`

作成するファイル:
- `.steering/YYYYMMDD-slug/requirements.md`
- `.steering/YYYYMMDD-slug/design.md`
- `.steering/YYYYMMDD-slug/tasklist.md`

生成方法:
- `../skills/steering/templates/*` をコピーして雛形として使い、
- `docs/` の設計ドキュメントから該当箇所を抽出して具体化する

**requirements.md の必須項目**:
- PRDの該当ユーザーストーリー・受け入れ条件を引用
- スコープ外を明記
- 受け入れ条件は「検証可能」な粒度でチェックボックスにする

**design.md の必須項目**:
- `docs/functional-design.md` の該当コンポーネント設計を引用・具体化
- `docs/architecture.md` のレイヤー構造に従った設計
- `docs/repository-structure.md` のファイル配置・命名規則に従う
- エラーハンドリング/テスト方針を含める

**tasklist.md の必須項目**:
- 1タスク=30〜90分目安で分割（大きい場合はサブタスク化）
- 「検討」「後で」禁止
- 実装・テスト・lint/typecheck・ドキュメント更新まで含める

### 2) 実装ループ（tasklist完全消化）
`tasklist.md` の `[ ]` がゼロになるまで、次を繰り返してください。

1. `.steering/YYYYMMDD-slug/tasklist.md` を読む
2. 先頭の未完了タスク（`[ ]`）を1つ選ぶ
3. **既存パターンを確認**: 同種のファイルがあれば参考にする
4. 実装（必要なファイルを作成/編集）
5. 完了したら tasklist の該当項目を `[x]` に更新
6. 次の未完了タスクへ

**例外処理**:
- タスクが大きすぎる → 分割して tasklist を更新し、分割後のサブタスクから消化
- 技術的理由で不要 → `- [x] ~~タスク~~（理由: …）` にして、必要なら代替タスクを追加

### 3) 検証
プロジェクトに存在するコマンドを実行して、エラーがあれば直して再実行:
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### 4) 仕上げ（振り返り）
`.steering/YYYYMMDD-slug/tasklist.md` の最下部「実装後の振り返り」を埋める:
- 実装完了日
- 計画との差分（変更点と理由）
- 学び / 次回改善

### 5) 最終出力（チャット返信）
最後に、次だけを簡潔に返してください:
- 作成した steering パス
- 変更した主要ファイル一覧
- 受け入れ条件に対する自己チェック結果（OK/NGと理由）