# 設計書

## アーキテクチャ概要

既存のNext.js App Router + Server Actions パターンに従い、履歴機能を追加。

```
┌─────────────────────────────────────────────────────┐
│  UI Layer                                          │
│  - /dashboard/history/page.tsx (履歴一覧)          │
│  - /dashboard/history/[sessionId]/page.tsx (詳細)   │
│  - components/history/* (履歴コンポーネント)        │
├─────────────────────────────────────────────────────┤
│  API Layer (Server Actions)                        │
│  - /dashboard/history/actions.ts                   │
├─────────────────────────────────────────────────────┤
│  Data Layer                                        │
│  - 既存テーブル: diagnosis_sessions, search_runs,   │
│    comparison_matrices, proposal_outputs           │
└─────────────────────────────────────────────────────┘
```

## コンポーネント設計

### 1. HistoryPage（履歴一覧ページ）

**責務**:
- 履歴データの取得・表示
- フィルター状態管理
- ページネーション

**実装の要点**:
- Server Componentでデータ取得
- Client Componentでフィルター操作

### 2. HistoryList（履歴リストコンポーネント）

**責務**:
- 履歴アイテムのリスト表示
- 空状態・ローディング表示

### 3. HistoryCard（履歴カード）

**責務**:
- 各履歴アイテムの表示
- ステータスバッジ表示
- クイックアクション

### 4. HistoryFilters（フィルターコンポーネント）

**責務**:
- ステータス・カテゴリ・期間フィルター
- フィルター状態のURL同期

### 5. SessionDetail（セッション詳細ページ）

**責務**:
- 診断入力内容の表示
- 検索結果・比較・稟議の表示
- 再開・再診断アクション

## データフロー

### 履歴一覧取得
```
1. HistoryPage → getHistoryList(filters)
2. Server Action → Supabase Query
   - diagnosis_sessions JOIN diagnosis_inputs, search_runs, proposal_outputs
3. 整形してHistoryItemとして返却
```

### セッション再開
```
1. 「再開」ボタン → /dashboard/diagnosis?session=<sessionId>
2. DiagnosisPage → getSession(sessionId)
3. フォームに既存データをpopulate
4. 未入力ステップから開始
```

## エラーハンドリング戦略

### エラーケース
- 認証切れ → ログインページへリダイレクト
- セッション不存在 → 404ページ
- データ取得失敗 → エラーメッセージ表示 + リトライボタン

## テスト戦略

### ユニットテスト
- フィルターロジック
- 日付フォーマット関数

### 統合テスト（E2E）
- 履歴一覧表示
- フィルター操作
- 詳細ページ遷移
- セッション再開

## ディレクトリ構造

```
src/
├── app/dashboard/history/
│   ├── page.tsx              # 履歴一覧
│   ├── actions.ts            # Server Actions
│   ├── [sessionId]/
│   │   └── page.tsx          # セッション詳細
│   └── _components/
│       ├── history-list.tsx
│       ├── history-card.tsx
│       └── history-filters.tsx
├── components/layout/
│   └── sidebar.tsx           # 履歴メニュー追加
└── types/
    └── history.ts            # 履歴関連型定義
```

## 実装の順序

1. 型定義追加（types/history.ts）
2. Server Actions実装（history/actions.ts）
3. 履歴一覧ページ実装
4. 履歴カード・リストコンポーネント
5. フィルターコンポーネント
6. 詳細ページ実装
7. サイドバー更新
8. 診断フォーム再開機能
9. テスト・品質チェック

## セキュリティ考慮事項

- RLSにより自テナントのデータのみ取得可能（既存ポリシー活用）
- Server Actionsで認証チェック必須

## パフォーマンス考慮事項

- 履歴一覧は最新20件をデフォルト表示
- ページネーションでスクロール負荷軽減
- diagnosis_sessions.tenant_id + created_at のインデックス活用
