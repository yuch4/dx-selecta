# タスクリスト: 提案書カスタマイズ機能

## 🚨 タスク完全完了の原則

**このファイルの全タスクが完了するまで作業を継続すること**

---

## フェーズ1: ユーティリティ実装

- [x] 1.1 lib/proposal/parser.ts 作成
  - [x] parseMarkdownToSections関数
  - [x] sectionsToMarkdown関数
  - [x] ProposalSection型定義

## フェーズ2: Server Actions追加

- [x] 2.1 proposal/actions.ts 更新
  - [x] updateProposal関数追加
  - [x] getProposalVersions関数追加
  - [x] バージョン管理ロジック

## フェーズ3: UIコンポーネント実装

- [x] 3.1 section-editor.tsx 作成
  - [x] 編集/プレビュー切替UI
  - [x] textareaでの編集機能
  - [x] 保存/キャンセルボタン

- [x] 3.2 proposal-editor.tsx 作成
  - [x] セクションリスト表示
  - [x] 編集状態管理
  - [x] 保存処理統合（useTransition使用）

- [x] 3.3 proposal-view.tsx（変更なし）
  - [x] 既存の表示機能で対応

## フェーズ4: 統合・動線

- [x] 4.1 proposal-content.tsx 更新
  - [x] ProposalEditor統合
  - [x] 編集/プレビューモード切替
  - [x] 保存時の状態更新

- [x] 4.2 proposal-actions.tsx 更新
  - [x] 「編集」ボタン追加
  - [x] モード切替ロジック
  - [x] 編集中は再生成無効化

## フェーズ5: 品質チェック

- [x] 5.1 lint/build確認
  - [x] `npm run lint`
  - [x] `npm run build`

- [ ] 5.2 動作確認
  - [ ] 編集→保存フロー
  - [ ] バージョン履歴表示

## 追加タスク

- [x] sonnerパッケージ追加（トースト通知）
- [x] layout.tsx にToaster追加

---

## 実装後の振り返り

### 実装完了日
2026-01-12

### 計画と実績の差分

**計画と異なった点**:
- sonnerパッケージが未インストールだったため追加
- proposal-view.tsx は変更不要だった（既存実装で十分）
- Server ActionsをClientコンポーネントから呼ぶためuseTransitionを使用

**新たに必要になったタスク**:
- Toasterコンポーネントをlayout.tsxに追加
- ReactMarkdown classNameの修正（新バージョン対応）

### 学んだこと

**技術的な学び**:
- Next.js App RouterでServer Actionsをクライアントから呼ぶ場合、useTransitionが推奨
- ReactMarkdownの新バージョンではclassNameは親要素で指定
- sonnerはシンプルで使いやすいトースト通知ライブラリ

**プロセス上の改善点**:
- 依存パッケージの事前確認が必要
- UIライブラリのAPIバージョン差異に注意
