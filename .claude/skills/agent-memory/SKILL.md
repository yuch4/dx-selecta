---
name: agent-memory
description: 会話を越えて知識を保存・検索するスキル。「これを覚えておいて」「保存して」「メモして」「〜について何か話した？」「ノートを確認して」「メモリを整理して」などのリクエストに使用。価値ある発見を見つけた時にも積極的に使用する。
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
user-invocable: true
---

# Agent Memory

会話を越えて知識を永続化するメモリスペース。

**保存先:** `.claude/skills/agent-memory/memories/`

## 積極的な使用

### 保存すべき時

- 調査で発見した価値ある知見
- コードベースの非自明なパターンやgotcha
- トリッキーな問題の解決策
- アーキテクチャ上の決定とその根拠
- 後で再開する可能性のある作業

### 確認すべき時

- 問題領域を調査する前
- 以前触れた機能に取り組む時
- 会話を再開する時

### 整理すべき時

- 同じトピックの散在したメモリを統合
- 古くなった情報を削除
- 作業完了・ブロック・放棄時にstatusを更新

## フォルダ構造

カテゴリフォルダで整理する。事前定義された構造はなく、コンテンツに合わせて作成する。

```text
memories/
├── knowledge-base/
│   └── claude-code-spec.md
├── project-context/
│   └── current-work.md
└── troubleshooting/
    └── issue-fix.md
```

ファイル名はkebab-caseを使用。

## フロントマター

すべてのメモリに`summary`フィールドを含むフロントマターが必須。

**必須:**
```yaml
---
summary: "このメモリが何を含むかの1-2行の説明"
created: 2025-01-15
---
```

**オプション:**
```yaml
---
summary: "大容量ファイル処理時のワーカースレッドメモリリーク - 原因と解決策"
created: 2025-01-15
updated: 2025-01-20
status: in-progress  # in-progress | resolved | blocked | abandoned
tags: [performance, worker, memory-leak]
related: [src/core/file/fileProcessor.ts]
---
```

## 検索ワークフロー

サマリーファーストアプローチで効率的に検索:

```bash
# 1. カテゴリ一覧
ls .claude/skills/agent-memory/memories/

# 2. 全サマリー表示
rg "^summary:" .claude/skills/agent-memory/memories/ --no-ignore --hidden

# 3. キーワードでサマリー検索
rg "^summary:.*keyword" .claude/skills/agent-memory/memories/ --no-ignore --hidden -i

# 4. タグ検索
rg "^tags:.*keyword" .claude/skills/agent-memory/memories/ --no-ignore --hidden -i

# 5. 全文検索（サマリー検索で不十分な場合）
rg "keyword" .claude/skills/agent-memory/memories/ --no-ignore --hidden -i
```

## 操作

### 保存

```bash
mkdir -p .claude/skills/agent-memory/memories/category-name/
cat > .claude/skills/agent-memory/memories/category-name/filename.md << 'EOF'
---
summary: "このメモリの簡潔な説明"
created: 2025-01-15
---

# タイトル

内容...
EOF
```

### メンテナンス

- **更新**: 情報変更時は内容を更新し、frontmatterに`updated`を追加
- **削除**: 不要なメモリを削除、空のカテゴリフォルダも削除
- **統合**: 関連メモリが増えたらマージ
- **再編成**: 知識ベースの進化に合わせてカテゴリを移動

## ガイドライン

1. **自己完結型のノートを書く**: 読者が事前知識なしで理解・行動できる完全な文脈を含める
2. **決定的なサマリー**: サマリーを読めば詳細が必要かどうか判断できる
3. **最新を保つ**: 古い情報は更新または削除
4. **実用的に**: すべてではなく、実際に役立つものを保存
