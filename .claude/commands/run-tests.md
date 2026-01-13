---
description: 直近の実装に対してユニットテスト/E2Eテストを作成・実行する。テスト環境のセットアップから実行、カバレッジ確認まで。
argument-hint: 対象 種別 [フォーカス] 例) services/auth.service.ts unit
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Run Tests (Unit & E2E)

直近で実装された機能に対してテストを作成・実行する。

## 入力
$1 = テスト対象（例: services/auth.service.ts）
$2 = テスト種別（unit / e2e / both）
$3 = フォーカス領域（任意）

## 参照
- 開発規約: `docs/development-guidelines.md`

## 実行フロー

### 1) 対象の特定
```bash
# 直近の変更を確認
git diff HEAD~1 --name-only | grep -E '\.(ts|tsx)$'
```

### 2) ユニットテスト（testType = unit / both）

**対象の判定**:
- Services (`src/services/*.ts`) → `tests/unit/services/`
- Utils (`src/lib/utils/*.ts`) → `tests/unit/utils/`

**テスト作成**:
- 正常系（ハッピーパス）
- 境界値（空配列、null、最大長）
- エラー系（例外、バリデーション失敗）

**テンプレート**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TargetService } from '@/services/target.service';

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
  });
});
```

### 3) E2Eテスト（testType = e2e / both）

**Playwrightテスト作成**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('[機能名]', () => {
  test('[シナリオ名]', async ({ page }) => {
    await page.goto('/target-page');
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### 4) テスト実行と検証
```bash
pnpm test                    # ユニットテスト
pnpm test:e2e               # E2Eテスト
pnpm test --coverage        # カバレッジ確認
```

## 出力フォーマット

```markdown
## テスト実行結果

**対象**: [テスト対象]
**種別**: unit / e2e / both

### 作成したテストファイル
- `tests/unit/services/xxx.test.ts`
- `tests/e2e/flows/xxx.spec.ts`

### 実行結果
| 種別 | テスト数 | 成功 | 失敗 |
|------|---------|------|------|
| Unit | X | X | 0 |
| E2E | X | X | 0 |

### カバレッジ
| ファイル | 行 | 分岐 | 関数 |
|----------|-----|------|------|
| xxx.ts | 85% | 70% | 100% |
```
