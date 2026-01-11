# 要求定義: 比較機能 & 稟議書生成

## 背景
検索・推薦機能が完成し、ユーザーはTop 5の製品を取得できるようになった。次のステップとして：
1. 選択した製品を比較するマトリクス表示
2. 推奨製品の稟議書を自動生成する機能

## 対象PRD機能
- PRD: 3. 比較UI（ComparisonMatrix、比較軸、CSVエクスポート）
- PRD: 4. 稟議1枚生成（Markdown形式、テンプレート適用）

---

## 機能1: 比較機能

### スコープ
1. **DBスキーマ**
   - comparison_matrices テーブル

2. **Server Actions**
   - generateMatrix: 比較マトリクス生成
   - getMatrix: マトリクス取得

3. **比較ロジック**
   - 比較軸の自動決定（価格、SSO、監査ログ、モバイル等）
   - セルデータの構築

4. **UI**
   - /compare ページ
   - 比較テーブル（製品×比較軸）
   - CSVエクスポートボタン

---

## 機能2: 稟議書生成

### スコープ
1. **DBスキーマ**
   - proposal_outputs テーブル

2. **Server Actions**
   - generateProposal: 稟議書生成
   - getProposal: 稟議書取得

3. **稟議ロジック**
   - テンプレートベースの生成（MVP: AI不使用）
   - Markdown形式での出力

4. **UI**
   - /proposal ページ
   - Markdown表示
   - コピーボタン
   - 再生成ボタン

---

## 成功基準
- 検索結果から2件以上選択 → /compare で比較表示
- 比較画面から稟議生成 → /proposal でMarkdown表示
- 稟議書をコピー可能
