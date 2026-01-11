---
applyTo: "**/*.test.{ts,tsx},tests/**/*"
---

# テスト規約

## フレームワーク

- ユニット/統合: Vitest
- E2E: Playwright

## 配置

| 種別 | 配置 | 対象 |
|------|------|------|
| ユニット | `tests/unit/` | Services, Utils, 純粋関数 |
| 統合 | `tests/integration/` | API Routes + DB |
| E2E | `tests/e2e/` | ユーザーフロー |

## 命名規則

```typescript
// ファイル名: [対象].test.ts
// deduplication.service.test.ts

// テスト名: 日本語で明確に
describe('DeduplicationService', () => {
  describe('filterDuplicates', () => {
    it('重複URLの記事を除外する', () => {});
    it('同一バッチ内の重複も除外する', () => {});
  });
});
```

## モック戦略

- 外部API（Gemini, YouTube）: vi.mock でモック
- Supabase: テスト用クライアントまたはモック
- 時刻: vi.useFakeTimers

### Supabase MCP Server（データ確認）

テストデータの確認やスキーマ検証には **Supabase MCP Server** を使用（CLI直接実行は禁止）:

```
mcp:supabase list_tables
mcp:supabase get_table_schema --table=articles
mcp:supabase execute_sql --query="SELECT * FROM articles LIMIT 5"
```

## カバレッジ目標

- ユニット: 80%（特にサービス層）
- 統合: 主要なハッピーパス + エラーケース
