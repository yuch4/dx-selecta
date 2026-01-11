---
description: steering駆動で新機能を「計画→レビュー→実装→検証→振り返り」まで完了させる
---

# Add Feature (steering-driven)

あなたはリポジトリに対して、安全に・既存パターンに従って機能を追加する実装者です。
このプロンプトは **計画レビューモード** です。実装開始前に必ずユーザーの承認を得てください。

## 入力
- 機能名: ${input:featureName:例) ユーザープロフィール編集}
- 追加メモ（任意）: ${input:notes:例) supabaseのprofilesテーブルを使う / UIはapp router}

## 参照（重要）
- steering skill: [SKILL](../skills/steering/SKILL.md)
- steering templates:
  - [requirements](../skills/steering/templates/requirements.md)
  - [design](../skills/steering/templates/design.md)
  - [tasklist](../skills/steering/templates/tasklist.md)
- 開発規約（ある場合）: `docs/development-guidelines.md`
- 既存設計（ある場合）: `docs/functional-design.md`, `docs/architecture.md`, `docs/repository-structure.md`
- スタック規約: `.github/instructions/nextjs-supabase.instructions.md`
  - **Supabase操作はMCP Serverを使用**（CLI直接実行禁止）
- ブランチワークフロー: `.github/instructions/branching-workflow.instructions.md`

---

## 実行手順

### 0) 前提確認 & ブランチ判定

1. `docs/` と `.github/skills/steering/` の存在を確認する。無い場合は必要最小限を作成。

2. **Vercelデプロイ状況を判定**:
   ```bash
   # vercel.json の存在確認 & Vercel連携済みか確認
   ls vercel.json 2>/dev/null && echo "Vercel設定あり"
   ```
   
   **判定基準**:
   - `vercel.json` が存在 AND 本番デプロイ済み → **ブランチ作成が必要**
   - それ以外（開発初期段階） → main ブランチで直接作業OK

3. **ブランチ作成が必要な場合（Vercelデプロイ済み）**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/<機能名-kebab-case>
   ```
   - 機能名を英語 kebab-case に変換（例: `user-profile-edit`）
   - 以降の作業はこのブランチで行う
   - 作成したブランチ名を記録しておく

4. **デプロイ前の場合**:
   - main ブランチのまま作業を継続（ブランチ作成スキップ）

### 1) ステアリング作成（計画）
以下のルールで steering ディレクトリを作成し、3ファイルを生成してください。

- 日付: 今日を `YYYYMMDD`
- slug: featureName を短い英語・kebab-case に正規化（例: user-profile-edit）
- パス: `.steering/YYYYMMDD-slug/`

作成するファイル:
- `.steering/YYYYMMDD-slug/requirements.md`
- `.steering/YYYYMMDD-slug/design.md`
- `.steering/YYYYMMDD-slug/tasklist.md`

生成方法:
- `../skills/steering/templates/*` をコピーして雛形として使い、
- `docs/` と既存コード（特に `src/`）を読んで、内容を具体化して埋める。

requirements.md の必須:
- 受け入れ条件は「検証可能」な粒度でチェックボックスにする
- スコープ外を明記する

design.md の必須:
- 既存パターンの踏襲（命名・配置・責務分離）
- エラー/セキュリティ/テスト方針を最低限含める

tasklist.md の必須:
- 1タスク=30〜90分目安で分割（大きい場合はサブタスク化）
- 「検討」「後で」禁止
- 実装・テスト・lint/typecheck（存在するなら）・ドキュメント更新まで含める

### 2) レビュー & 承認待ち（⚠️ ここで必ず停止）

**計画内容をユーザーに提示し、承認を得るまで実装を開始しない。**

以下の形式で計画サマリーを出力してください：

---

## 📋 実装計画レビュー

### 機能概要
- **機能名**: ${featureName}
- **作業ブランチ**: main または feature/xxx
- **steeringパス**: `.steering/YYYYMMDD-slug/`

### 受け入れ条件（requirements.md より）
- [ ] 条件1
- [ ] 条件2
- ...

### 設計サマリー（design.md より）
- **影響範囲**: 変更/新規作成するファイル・コンポーネント
- **データ変更**: DBスキーマ変更の有無
- **外部連携**: API・外部サービスとの連携有無

### タスク一覧（tasklist.md より）
| # | タスク | 見積もり |
|---|--------|----------|
| 1 | タスク内容 | 30-90min |
| 2 | ... | ... |

### リスク・懸念事項
- （あれば記載）

---

**👆 上記の計画内容を確認してください。**

- ✅ 承認する場合: 「承認」「OK」「進めて」などと返信
- ❌ 修正が必要な場合: 修正内容を指示してください（計画を更新して再度レビュー）
- ⏸️ 中止する場合: 「中止」「キャンセル」と返信

---

### 3) 実装ループ（承認後・tasklist完全消化）

**⚠️ ユーザーから承認を得てから、このステップに進んでください。**
`tasklist.md` の `[ ]` がゼロになるまで、次を繰り返してください。

1. `.steering/YYYYMMDD-slug/tasklist.md` を読む
2. 先頭の未完了タスク（`[ ]`）を1つ選ぶ
3. 実装（必要なファイルを作成/編集）
4. 完了したら tasklist の該当項目を `[x]` に更新
5. 次の未完了タスクへ

例外:
- タスクが大きすぎる → 分割して tasklist を更新し、分割後のサブタスクから消化
- 技術的理由で不要 → `- [x] ~~タスク~~（理由: …）` にして、必要なら代替タスクを追加

### 4) 検証
プロジェクトに存在するコマンドだけ実行して、落ちたら直して再実行してください。
- `pnpm test`（または `npm test`）
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

### 5) 仕上げ（振り返り）
`.steering/YYYYMMDD-slug/tasklist.md` の最下部「実装後の振り返り」を埋めてください。
- 実装完了日
- 計画との差分（変更点と理由）
- 学び / 次回改善

### 6) コミット & Push（ブランチ作成した場合のみ）

**Vercelデプロイ済み（ブランチで作業中）の場合**:
```bash
git add .
git commit -m "feat: <機能の説明>"
git push -u origin feature/<機能名>
```

PR作成:
```bash
gh pr create --title "feat: <機能名>" --body "## 概要
<変更内容の説明>

## 変更ファイル
<主要な変更ファイル一覧>

## 確認事項
- [ ] Vercel Previewで動作確認
- [ ] lint/typecheck/test 通過
"
```

**デプロイ前（mainで作業中）の場合**:
```bash
git add .
git commit -m "feat: <機能の説明>"
git push origin main
```

### 7) 最終出力（チャット返信）
最後に、次だけを簡潔に返してください。
- 作業ブランチ（mainまたはfeature/xxx）
- 作成した steering パス
- 変更した主要ファイル一覧
- 受け入れ条件に対する自己チェック結果（OK/NGと理由）
- **（ブランチの場合）次のアクション**: 「Vercel Previewで確認 → 問題なければPRをマージ」
