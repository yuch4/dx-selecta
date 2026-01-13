---
name: design-principles
description: Linear、Notion、Stripe風の精密なデザインシステムを適用する。ダッシュボード、管理画面、SaaSインターフェースなどJony Ive級の精密さが必要なUI向け。「ダッシュボードを作って」「管理画面のUI」「UIデザイン原則を適用」「精密なデザイン」などの依頼時に使用。
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Design Principles Skill

エンタープライズソフトウェア、SaaSダッシュボード、管理画面、Webアプリケーション向けの精密でクラフテッドなデザインを適用する。

## デザイン方向（必須）

**コードを書く前に、デザイン方向を決める。**

### コンテキストを考える

- このプロダクトは何をする？
- 誰が使う？パワーユーザー vs 時々のユーザー
- 感情的な仕事は？信頼？効率？喜び？集中？
- 何がこれを記憶に残るものにする？

### パーソナリティを選ぶ

| 方向 | 特徴 | 参考 |
|------|------|------|
| Precision & Density | タイトなスペーシング、モノクローム、情報優先 | Linear, Raycast |
| Warmth & Approachability | 余裕のあるスペーシング、ソフトシャドウ、フレンドリーカラー | Notion, Coda |
| Sophistication & Trust | クールトーン、レイヤード深度、金融的重厚感 | Stripe, Mercury |
| Boldness & Clarity | ハイコントラスト、ドラマティックな余白、自信に満ちたタイポグラフィ | Vercel |
| Utility & Function | ミュートパレット、機能的密度、明確な階層 | GitHub |

## コアクラフト原則

### 4pxグリッド
すべてのスペーシングは4pxベース：
- `4px` - マイクロ（アイコンギャップ）
- `8px` - タイト（コンポーネント内）
- `12px` - 標準（関連要素間）
- `16px` - コンフォータブル（セクションパディング）
- `24px` - ジェネラス（セクション間）

### 対称パディング
**TLBRは一致させる。**

```css
/* Good */
padding: 16px;
padding: 12px 16px; /* 水平にスペースが必要な場合のみ */

/* Bad */
padding: 24px 16px 12px 16px;
```

### ボーダーラディアス一貫性
4pxグリッドに従う：
- シャープ: 4px, 6px, 8px
- ソフト: 8px, 12px
- ミニマル: 2px, 4px, 6px

### 深度戦略

**デザイン方向に合わせる：**

- **Borders-only (flat)** — クリーン、テクニカル、密度高い
- **Subtle single shadows** — ソフトなリフト
- **Layered shadows** — リッチ、プレミアム
- **Surface color shifts** — シャドウなしで階層を確立

### タイポグラフィ階層
- Headlines: 600 weight, tight letter-spacing (-0.02em)
- Body: 400-500 weight, standard tracking
- Labels: 500 weight, slight positive tracking
- Scale: 11px, 12px, 13px, 14px (base), 16px, 18px, 24px, 32px

### データ用モノスペース
数字、ID、コード、タイムスタンプはモノスペース。`tabular-nums`で列揃え。

### アイコン
Phosphor Icons（`@phosphor-icons/react`）を使用。意味がないなら削除。

### アニメーション
- 150ms（マイクロインタラクション）
- 200-250ms（大きな遷移）
- Easing: `cubic-bezier(0.25, 1, 0.5, 1)`
- エンタープライズUIではスプリング/バウンシーなし

### 色は意味のためだけ
グレーで構造を構築。色はステータス、アクション、エラー、成功を伝える時のみ。

## アンチパターン

避けること：
- ドラマティックなドロップシャドウ
- 小要素への大きなボーダーラディアス（16px+）
- 非対称パディング
- 厚いボーダー（2px+）装飾
- 過剰スペーシング（48px+マージン）
- スプリング/バウンシーアニメーション
- 装飾グラデーント
- 複数アクセントカラー

## 基準

すべてのインターフェースは、1ピクセルの違いにこだわるチームがデザインしたように見えるべき。
