# 設計: 残りのMVP機能実装

## Phase 1: サンプルデータ投入

### データ構造
solutionsテーブルに5-10件の代表的なバックオフィスSaaSを投入。

**対象カテゴリ**:
- expense（経費精算）: マネーフォワード クラウド経費、楽楽精算、freee経費精算
- accounting（会計）: freee会計、マネーフォワード クラウド会計
- attendance（勤怠）: KING OF TIME、ジョブカン勤怠
- workflow（ワークフロー）: ジョブカンワークフロー

**各ソリューションのデータ**:
```typescript
{
  name: string,          // 製品名
  vendor: string,        // ベンダー名
  category: string,      // カテゴリ
  description: string,   // 説明文
  website_url: string,   // 公式サイトURL
  facts: {               // JSON（または別テーブル）
    has_sso: boolean,
    has_audit_log: boolean,
    min_price_jpy: number,
    supported_languages: string[],
    integrations: string[]
  }
}
```

### 投入方法
Supabase MCP経由でSQL実行

---

## Phase 2: Google OAuth

### Supabase設定
1. Google Cloud Consoleでプロジェクト作成
2. OAuth 2.0 クライアントID取得
3. Supabase DashboardでGoogleプロバイダー有効化
4. リダイレクトURL設定

### UI変更
```
/login
├── メールアドレス入力（既存）
└── [Googleでログイン] ボタン追加
```

### 実装
- `@supabase/ssr` の `signInWithOAuth` 使用
- コールバックは既存の `/auth/callback` を使用

---

## Phase 3: 生成履歴UI

### データソース
既存の `proposal_outputs` テーブルを使用
```sql
SELECT id, created_at, version, markdown_text
FROM proposal_outputs
WHERE tenant_id = ?
ORDER BY created_at DESC
```

### UI設計
```
/dashboard/proposal
├── 新規生成（既存）
└── 履歴一覧
    ├── [2026-01-11] v1 - 経費精算ツール比較
    ├── [2026-01-10] v2 - 会計ソフト導入
    └── ...
```

### コンポーネント
- `proposal-history.tsx`: 履歴一覧
- `proposal-history-item.tsx`: 履歴アイテム

---

## Phase 4: Google Docs出力（オプション）

### 技術スタック
- Google APIs (`googleapis` npm package)
- OAuth2 consent flow
- Google Docs API v1

### フロー
1. ユーザーが「Google Docsに出力」クリック
2. Google OAuth consent画面表示
3. 認証後、Docs APIで新規ドキュメント作成
4. MarkdownをDocsフォーマットに変換して挿入
5. ドキュメントURLをユーザーに返す

### 複雑性
- Google OAuthとSupabase Authの統合が複雑
- Markdown→Docs変換ライブラリが必要
- **MVPでは省略可**

---

## ファイル構成

```
src/
├── app/
│   ├── (auth)/login/
│   │   └── page.tsx  # Google OAuth追加
│   └── (dashboard)/proposal/
│       └── _components/
│           └── proposal-history.tsx  # 履歴UI
├── components/
│   └── auth/
│       └── google-button.tsx  # Googleログインボタン
└── lib/
    └── supabase/
        └── client.ts  # signInWithOAuth追加
```
