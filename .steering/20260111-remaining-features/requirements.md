# 要件: 残りのMVP機能実装

## 背景
DX SelectaのMVP実装において、診断フォーム、検索UI、比較マトリクス、稟議書生成の基本機能は実装済み。
ただし、PRDで定義された受け入れ条件のうち、以下が未実装のため動作確認・本番利用ができない状態。

## 目的
MVP機能を完成させ、実際に動作確認できる状態にする。

## スコープ

### Phase 1: サンプルデータ投入（最優先）
- solutions, solution_facts テーブルにテストデータを投入
- 検索・比較・稟議の一連のフローを動作確認可能にする

### Phase 2: Google OAuth認証
- Supabase AuthにGoogleプロバイダーを追加
- ログイン画面にGoogleボタンを追加

### Phase 3: 生成履歴UI
- 過去の稟議書一覧を表示
- 履歴から稟議書を再表示

### Phase 4（オプション）: Google Docs出力
- OAuth認証でGoogle API連携
- 稟議書をGoogle Docsに出力

## 優先度
1. サンプルデータ → これがないと何も確認できない
2. Google OAuth → ログイン体験改善
3. 生成履歴UI → 稟議書の価値向上
4. Google Docs出力 → 利便性向上（時間があれば）

## 参照ドキュメント
- docs/product-requirements.md
- docs/architecture.md
