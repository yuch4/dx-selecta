---
description: 直近の実装に対してユニットテスト/E2Eテストを作成・実行する。画面操作が必要な場合はChrome DevTools MCPを使用。
tools: ["read", "search", "edit", "execute", "chrome-devtools/*"]
---

# Run Tests (Unit & E2E)

直近で実装された機能に対してテストを作成・実行します。

## 入力
- テスト対象: ${input:target:例) services/deduplication.service.ts / 画面フロー全体}
- テスト種別: ${input:testType:unit / e2e / both}
- フォーカス領域（任意）: ${input:focus:例) 重複検出 / ログイン〜ダッシュボード}

## 参照
- 開発規約: `docs/development-guidelines.md`
- テスト規約: `.github/instructions/testing.instructions.md`
- ステアリング: `.steering/` 内の最新フォルダ

---

## 実行フロー

### 0) テスト環境セットアップ（初回のみ）

**vitest.config.ts が存在しない場合**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**playwright.config.ts が存在しない場合**:
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**package.json にスクリプト追加**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 1) 対象の特定
```bash
# 直近の変更を確認
git diff HEAD~1 --name-only | grep -E '\.(ts|tsx)$'

# または .steering/ から特定
ls -la .steering/
```

### 2) ユニットテスト（testType = unit / both）

**対象の判定**:
- Services (`src/services/*.ts`) → `tests/unit/services/`
- Utils (`src/lib/utils/*.ts`) → `tests/unit/utils/`
- Repositories は統合テストで扱う

**テスト作成の手順**:
1. 対象ファイルを読む
2. publicメソッドのインターフェースを確認
3. 以下のケースを網羅するテストを作成:
   - 正常系（ハッピーパス）
   - 境界値（空配列、null、最大長）
   - エラー系（例外、バリデーション失敗）

**テンプレート**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TargetService } from '@/services/target.service';

// 外部依存はモック
vi.mock('@/lib/gemini/client', () => ({
  generateContent: vi.fn().mockResolvedValue('mocked summary'),
}));

describe('TargetService', () => {
  let service: TargetService;

  beforeEach(() => {
    service = new TargetService();
    vi.clearAllMocks();
  });

  describe('methodName', () => {
    it('正常系: 期待する結果を返す', async () => {
      const result = await service.methodName(input);
      expect(result).toEqual(expected);
    });

    it('境界値: 空配列の場合は空配列を返す', async () => {
      const result = await service.methodName([]);
      expect(result).toEqual([]);
    });

    it('エラー系: 不正入力で例外をスローする', async () => {
      await expect(service.methodName(null)).rejects.toThrow();
    });
  });
});
```

**実行**:
```bash
pnpm test tests/unit/services/target.service.test.ts
```

### 3) E2Eテスト（testType = e2e / both）

**Chrome DevTools MCP の使用条件**:
- 画面操作を伴うテストの場合
- Playwrightで自動化する前の探索的テスト
- デバッグ時の状態確認

**Playwrightテスト作成**:
```typescript
// tests/e2e/flows/[機能名].spec.ts
import { test, expect } from '@playwright/test';

test.describe('[機能名]', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン等の共通セットアップ
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('[シナリオ名]', async ({ page }) => {
    // 操作
    await page.goto('/target-page');
    await page.click('button:has-text("アクション")');

    // 検証
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

**Chrome DevTools MCPでの探索（画面操作テスト時）**:
```
# ブラウザを開いてDevToolsに接続
mcp:chrome-devtools connect

# 要素の確認
mcp:chrome-devtools evaluate "document.querySelector('[data-testid=\"target\"]')"

# 状態の確認
mcp:chrome-devtools evaluate "window.__NEXT_DATA__"
```

**実行**:
```bash
pnpm test:e2e tests/e2e/flows/[機能名].spec.ts
```

### 4) テスト実行と検証

```bash
# ユニットテスト
pnpm test

# E2Eテスト
pnpm test:e2e

# カバレッジ確認
pnpm test --coverage
```

### 5) 出力

```markdown
## テスト実行結果

**対象**: [テスト対象]
**種別**: unit / e2e / both
**実行日**: YYYY-MM-DD

### 作成したテストファイル
- `tests/unit/services/xxx.test.ts`
- `tests/e2e/flows/xxx.spec.ts`

### 実行結果
| 種別 | テスト数 | 成功 | 失敗 | スキップ |
|------|---------|------|------|----------|
| Unit | X | X | 0 | 0 |
| E2E | X | X | 0 | 0 |

### カバレッジ
| ファイル | 行 | 分岐 | 関数 |
|----------|-----|------|------|
| xxx.ts | 85% | 70% | 100% |

### 検出した問題（あれば）
- [ ] [問題の説明と修正提案]
```
