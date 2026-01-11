# DXソリューション・レコメンドSaaS（バックオフィス特化 / 稟議1枚自動生成） 要件定義・設計書 v1.0

## 0. 目的と結論

本プロダクトは、バックオフィスSaaSの選定で発生する **「稟議で止まる／差し戻し地獄」**を解消する。
検索・比較を提供するだけでなく、**比較表と稟議1枚（Google Docs/コピペ）**を自動生成し、社内意思決定を前に進める。
	•	ユーザー検索のたびに外部サイトへアクセスしない
→ 事前に収集・正規化したDBから高速に検索・推薦する
	•	幅広さ×詳細さの核は 共通スキーマ（facts） と 根拠（chunks + evidence_url）
	•	収集は **CURATED（主要100〜300件を高品質）**で開始し、将来BROADへ拡張
	•	国内中心で開始するが、JP_GLOBAL拡張性を最初から器として持つ

⸻

## 1. プロダクト概要

1.1 ワンライナー（LP用）

「DXツール選定の結果を、稟議に通る比較表と申請書に自動変換するSaaS」

1.2 提供価値
	•	要件（Must/Should）を短時間で整理（診断）
	•	候補を短く絞り、比較軸を揃える（比較UI）
	•	根拠URL/最終確認日付きで説明可能（Explain）
	•	稟議1枚を生成し、差し戻しに強い（再生成/履歴）

⸻

## 2. ペルソナ

2.1 主要ペルソナ（MVP）
	•	中小〜中堅企業の情シス/IT担当（兼務含む）
	•	バックオフィスDX（会計/経費/勤怠/ワークフロー/電子契約/請求・購買）を任されている
	•	選定〜社内調整〜稟議が主業務になりがち

2.2 課金者
	•	会社（B2B）を主軸
	•	ただし導入の入口として個人プランも将来あり（稟議不要で開始できる）

⸻

## 3. 対決する課題（解決する課題）
	1.	比較軸が定まらず、検討が長期化（目安1ヶ月）
	2.	Must条件（SSO/監査ログ/契約/データ保管等）の見落とし
	3.	稟議で「根拠・費用・リスク・導入手順」が弱く差し戻し
	4.	条件変更があるたび、調査・比較・資料作成がやり直し

⸻

## 4. スコープ

4.1 初期（MVP）
	•	対象：国内バックオフィスSaaS中心（ただし拡張可能なデータモデル）
	•	機能：診断 → 推薦 → 比較 → Explain → 稟議1枚生成（Markdown/Google Docs）
	•	収集：CURATED（主要100〜300件を高品質）

4.2 将来
	•	海外SaaS（JP_GLOBAL）
	•	BROAD収集モード（件数拡大）
	•	RFP・問い合わせテンプレ、PoC計画テンプレ、運用設計テンプレ

⸻

## 5. 機能要件

5.1 認証・テナント設定
	•	Supabase Auth
	•	tenant_settings
	•	search_scope: JP_ONLY / JP_GLOBAL
	•	ingestion_mode: CURATED / BROAD

5.2 診断（要件入力）
	•	会社属性：業種、規模、体制、地域
	•	対象カテゴリ：会計/経費/勤怠/人事労務/ワークフロー/電子契約/請求受領/購買
	•	課題（複数選択 + 自由記述）
	•	Must条件（制約）：予算、導入期限、言語、SSO、監査ログ、データ保管等
	•	重み（優先度）：運用負荷、導入難易度、連携、セキュリティ、価格など

5.3 検索・推薦（ハイブリッド）
	•	Mustフィルタ（facts/price/integrations）
	•	BM25（Postgres全文） + ベクトル（pgvector）で候補抽出
	•	重み付きスコアでランキング
	•	Explain（根拠URL/抜粋/最終確認日/懸念点/質問リスト）

5.4 比較UI
	•	評価軸 × 候補（上位3〜5件）
	•	各セルに根拠URL
	•	“要確認”がある場合は明示（差し戻し耐性）

5.5 稟議1枚生成（主役）
	•	画面でMarkdown表示（コピペ）
	•	Google Docs生成（テンプレ差し込み）
	•	履歴保存（差し戻し再生成が価値）

5.6 収集・更新（裏側）
	•	Seed管理（主要プロダクトを手堅く）
	•	定期取得 → RAW保存 → chunk化 → facts抽出 → インデックス更新
	•	content_hashで差分抽出（変化がないなら再抽出しない）

⸻

## 6. 収益化の道筋（紹介料なし）
	•	中立性重視（紹介料/アフィリエイトなし）
	•	課金価値は「稟議成果物」と「差し戻し耐性（再生成/履歴/共有）」

プラン案（例）
	•	Free：診断、上位3、簡易比較
	•	Business：稟議生成、Docs出力、履歴、共有、生成回数増
	•	追加：生成クレジット（再生成ニーズに合わせる）

⸻

## 7. システム設計

7.1 アーキテクチャ思想
	•	ユーザー検索のたびにクローリングしない
	•	事前収集DBを参照して即返す（高速・再現性・根拠提示）
	•	収集は定期ジョブで段階的に回す（優先度と鮮度）

7.2 モード設計（切替可能）

収集モード
	•	CURATED（当面）：主要100〜300件を高品質で埋める
	•	BROAD（将来）：件数拡大（薄くても良い）

検索スコープ
	•	JP_ONLY（開始時）：国内中心
	•	JP_GLOBAL（拡張）：海外も対象

⸻

7.3 Crawl Policy（推奨値）

CURATED
	•	max_pages_per_solution: 20
	•	depth_limit: 2
	•	doc_types: pricing/features/security/integrations/cases/faq
	•	refresh:
	•	pricing/security: 7日
	•	features/integrations: 14日
	•	cases/faq: 30日
	•	rate_limit_rps: 0.2〜1.0
	•	respect_robots: true
	•	diff_by_content_hash: true

BROAD（将来）
	•	max_pages_per_solution: 300〜1000
	•	depth_limit: 4
	•	use_sitemap: true
	•	refresh: 30〜60日
	•	rate_limit_rps: 0.1〜0.5
	•	diff_by_content_hash: true

⸻

7.4 データモデル（要点）
	•	RAW（Storage）＋メタ（solution_docs）
	•	chunk（doc_chunks）で全文/ベクトル検索
	•	facts（solution_facts）でフィルタ/Explain
	•	integrations/pricingは専用テーブルで検索性担保
	•	海外拡張に備え origin_country / sales_regions / locales / currency を保持

（DDLは前回提示のテーブル群を採用）

⸻

## 8. 検索API仕様

8.1 POST /api/recommend
	•	入力：診断（constraints/weights/problem_statements）
	•	出力：上位3〜5 + comparison_matrix + explain

処理：
Mustフィルタ → ハイブリッド検索 → 重み付きスコアリング → Explain → top_k返却

8.2 POST /api/search
	•	入力：自由文 + filters
	•	出力：製品単位の結果 + ヒットスニペット + Explain

8.3 GET /api/explain
	•	入力：solution_id, run_id
	•	出力：facts + evidence_chunks + last_verified_at

8.4 POST /api/generate/proposal
	•	入力：run_id, primary_solution_id, format(markdown/google_docs)
	•	出力：proposal_outputs（markdown_text / google_doc_url）

⸻

## 9. 稟議1枚テンプレ（Markdown）

（前回提示のテンプレを採用：
背景→目的→要件→比較→推奨理由→懸念/対策→費用→導入ステップ→セキュリティ→質問→承認依頼）

⸻

## 10. バックオフィスカテゴリ別「質問リストテンプレ」完全版

方針：
	•	“差し戻し”を潰す質問に寄せる
	•	Must要件（SSO/監査ログ/データ保管/契約）を共通で必ず含める
	•	カテゴリ固有（電帳法/インボイス/勤怠ルール等）を追加

10.1 共通（全カテゴリ共通の必須質問）

セキュリティ/運用
	•	SSO対応（SAML/OIDC）と対応IdP（Azure AD/Google Workspace）の実績は？
	•	RBAC（権限設計）と監査ログ（操作履歴）の範囲、保持期間、エクスポート方法は？
	•	データ保管場所（リージョン）と暗号化（保管時/転送時）の方式は？
	•	バックアップ、障害時復旧（RPO/RTO相当）、SLAは？
	•	API/Webhookの有無と制限（レート、監査、IP制限）は？
	•	管理者が行うべき運用タスク（月次/週次）は？工数目安は？

契約/コスト
	•	課金単位（ユーザー/会社/取引件数/機能）と上限コストの考え方は？
	•	最低契約期間、解約条件、データエクスポート手段は？
	•	初期費用・導入支援費・トレーニング費は？
	•	見積の前提（ユーザー数/利用範囲）をどう置くべき？

導入
	•	導入の標準スケジュールと必要な社内体制は？
	•	移行（CSV/API）対応範囲と移行支援の有無は？
	•	トライアル/PoCの範囲と、撤退条件をどう置くべき？

⸻

10.2 経費精算（expense）
	•	領収書OCRの精度・対応形式（手書き/レシート/請求書）と再学習/修正フローは？
	•	電子帳簿保存法対応の範囲（真実性/可視性、タイムスタンプ、検索要件）と運用要件は？
	•	インボイス制度への対応（適格請求書、税区分、控除）と例外対応は？
	•	承認フローの柔軟性（部門/金額/プロジェクト別、代理承認、差戻し）と監査証跡は？
	•	法人カード連携（主要カード/明細取り込み）と照合ルールは？
	•	経費規程ルール（上限/禁止/アラート）設定はどこまで可能？

10.3 会計（accounting）
	•	仕訳自動化の範囲（ルール/学習/連携）と修正履歴は？
	•	売掛/買掛、請求/入金消込、支払（振込データ）までのカバー範囲は？
	•	部門/プロジェクト/複数拠点/複数法人対応（セグメント数上限含む）は？
	•	監査・締め処理（月次締め）に必要な機能（ロック、承認、証跡）は？
	•	税区分（消費税、軽減税率）や申告対応の範囲は？
	•	既存会計からの移行（科目/残高/補助科目）の方法と制約は？

10.4 勤怠（attendance）
	•	法定/所定、36協定、残業・深夜・休日の計算ルールの柔軟性は？
	•	シフト管理（複雑シフト、希望提出、突発変更）対応は？
	•	打刻手段（IC/スマホ/PC/位置情報）と不正防止（ジオフェンス等）は？
	•	休暇（有給/代休/特休）管理、付与ルール、繰越、申請承認の運用は？
	•	給与計算ソフトとの連携範囲とデータ形式は？
	•	締め〜修正〜再締めの監査証跡（誰がいつ何を変えたか）は？

10.5 人事労務（hr）
	•	従業員マスタの項目拡張、履歴管理（異動/評価/給与変更）は？
	•	入退社手続きのワークフローと書類管理（電子署名含む）は？
	•	マイナンバー等の機微情報の取り扱い（権限/暗号化/ログ）は？
	•	外部連携（給与/勤怠/会計）と同期の頻度/衝突解決は？
	•	組織変更への追随（部門階層、兼務、出向）対応は？

10.6 ワークフロー（workflow）
	•	フォーム設計（条件分岐、繰返し、添付、入力制御）の自由度は？
	•	承認経路（条件/多段/並列/代理/差戻し）の設定上限と運用性は？
	•	証跡（監査ログ、承認コメント、差戻し履歴）の検索・エクスポートは？
	•	他SaaS連携（Webhook/API、iPaaS）とエラー時リトライは？
	•	標準テンプレ（稟議/購買/契約/経費）提供の有無は？

10.7 電子契約（esign）
	•	電子署名の方式（当事者型/立会人型）と法的整理は？
	•	タイムスタンプ、改ざん検知、証跡（監査ログ）の提供範囲は？
	•	本人確認（eKYC）の有無と用途（必要なら）
	•	テンプレ/ワークフロー（送信→締結→保管）の柔軟性は？
	•	契約書の検索（全文/属性）と保管期間、エクスポートは？
	•	取引先の負担（アカウント必須か、UI言語、通知手段）は？

10.8 請求書受領・購買（ap/procurement）
	•	受領（メール/アップロード/郵送スキャン）チャネル対応は？
	•	OCR精度・例外処理（手入力）・差戻しフローは？
	•	発注〜検収〜支払のプロセスカバー範囲と承認経路は？
	•	取引先マスタ、支払条件、締め/支払スケジュール管理は？
	•	会計連携（仕訳生成/買掛計上/支払消込）範囲は？

⸻

## 11. スコアリング関数（SQL/TSで書ける形）

11.1 コンセプト
	•	Hard（Must）：満たさない候補は除外（または大幅減点）
	•	Soft（Should/優先度）：重み付き加点でランキング
	•	Explain：加点/減点理由と根拠URLを必ず出す

11.2 入力データ（共通）
	•	constraints（Must条件）
	•	weights（優先度の重み）
	•	製品データ：
	•	facts（sso/auditlog/data_residency/etc）
	•	pricing_plans
	•	integrations
	•	text_relevance（BM25/ベクトル由来の適合度）

⸻

11.3 TS擬似コード（そのまま実装できる形）

type Weights = {
  fit: number;
  implementation_ease: number;
  ops_load: number;
  integration: number;
  security: number;
  price: number;
};

type Constraint = {
  jp_support_required?: boolean;
  sso_required?: boolean;
  auditlog_required?: boolean;
  data_residency?: "JP" | "US" | "EU";
  budget_monthly_max_jpy?: number;
  integrations_required?: string[];
};

type CandidateSignals = {
  // 0..1 (1 is best)
  fit: number;                 // from BM25+vector
  implementation_ease: number; // from facts (or proxy)
  ops_load: number;            // from facts (or proxy)
  integration: number;         // required integration coverage
  security: number;            // sso/auditlog/certs/residency coverage
  price: number;               // within budget -> higher
  must: {
    jp_support_ok: boolean;
    sso_ok: boolean;
    auditlog_ok: boolean;
    residency_ok: boolean;
    budget_ok: boolean | "unknown";
    integrations_ok: boolean;
  };
  unknowns: string[];          // e.g. "pricing_unknown"
};

function hardFilter(c: CandidateSignals): boolean {
  // budget can be unknown -> keep but mark concern
  if (!c.must.jp_support_ok) return false;
  if (!c.must.sso_ok) return false;
  if (!c.must.auditlog_ok) return false;
  if (!c.must.residency_ok) return false;
  if (!c.must.integrations_ok) return false;
  return true;
}

function score(c: CandidateSignals, w: Weights): { total: number; breakdown: Record<string, number>; } {
  // Clamp weights to sum=1 in caller
  const breakdown = {
    fit: c.fit * w.fit,
    implementation_ease: c.implementation_ease * w.implementation_ease,
    ops_load: c.ops_load * w.ops_load,
    integration: c.integration * w.integration,
    security: c.security * w.security,
    price: c.price * w.price
  };
  let total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  // Penalize unknown critical items gently (avoid overfiltering)
  if (c.unknowns.includes("pricing_unknown")) total -= 0.03;
  if (c.unknowns.includes("security_unknown")) total -= 0.03;

  // Budget explicit fail -> heavy penalty (if you didn't hard filter)
  if (c.must.budget_ok === false) total -= 0.25;

  // Keep within [0,1]
  total = Math.max(0, Math.min(1, total));
  return { total, breakdown };
}

Explain生成（スコアと同時に作る）
	•	must_matches：trueの根拠URL
	•	top_reasons：breakdownの寄与が大きい上位3項目 + 根拠chunk
	•	concerns：unknown/弱点 + それに紐づく質問テンプレ

⸻

11.4 SQL寄りの考え方（実装の形）

SQLでやる場合は、候補集合に対して
	•	must_ok を boolで計算
	•	各軸の signal（0..1）を CASE で計算
	•	total = Σ(signal_i * weight_i) で並び替え

（※DB依存のため擬似SQL例は省略。必要ならSupabase前提の具体SQLを次に出します）

⸻

## 12. Seed（主要国内バックオフィスSaaS）初期リストの作り方（運用フロー）

12.1 方針
	•	いきなり自動で全部集めない
→ 主要プロダクトを確実に埋める（CURATED）
	•	Seedは「製品ごとの重要URL（pricing/security/features/integrations）」を保持し、更新を安定化
	•	段階的に増やす（100→200→300）

⸻

12.2 Seed作成ステップ（初期構築）

Step 1：カテゴリ別にトップ候補を決める（各カテゴリ20〜40）
	•	経費：主要な国内SaaSを20〜30
	•	会計：主要を20〜30
	•	勤怠：主要を20〜30
	•	ワークフロー：主要を20〜30
	•	電子契約：主要を10〜20
	•	請求受領/購買：主要を10〜20

初期100〜300件の根拠：
“検索の幅広さ”より、“稟議で使える詳細さ”が先。
欠損が少ないDBのほうがプロダクト価値が高い。

Step 2：各製品の entry_points を手で登録（重要）

solution_seeds.entry_points に以下を入れる：
	•	pricing URL（最重要）
	•	security URL（SSO/監査ログ/データ保管の根拠になりやすい）
	•	features URL（fit/機能）
	•	integrations URL（連携）
	•	cases URL（導入事例：導入難易度の proxy に使える）

Step 3：crawl_policy を割り当て
	•	まずは全件CURATED（max_pages=20, depth=2）

⸻

12.3 Seed運用（更新・品質維持）

週次ルーチン（おすすめ）
	•	価格/セキュリティが “要確認” の製品を優先で再取得
	•	last_verified_at が古い製品を再クロール
	•	欠損項目（必須facts）が多い製品を改善対象にする

欠損検知（品質ゲート）

「稟議に必要な必須項目」が埋まっていない製品は
	•	検索ランキングで下げる
	•	UIで “要確認” を明示
	•	質問リストに自動追加（価格不明/SSO不明など）

⸻

12.4 将来：ユーザーURL追加（オンデマンド取り込み）
	•	ユーザーがURLを貼る → “候補に追加（調査中）”
	•	裏で取得・抽出してDBに追加
	•	検索のたびに外へ行くのではなく 追加時のみ

⸻

## 13. 稟議生成と質問テンプレの接続ルール
	•	稟議1枚の「確認事項」は
	1.	共通質問テンプレ
	2.	カテゴリ質問テンプレ
	3.	その候補の欠損factsに対応する追加質問
を合成して作る

例：経費SaaSで pricing_unknown なら
	•	「課金単位と上限コスト」「最低契約期間」「追加費用の条件」を強制追加

⸻

## 14. KPI（刺さり判定）
	•	診断→稟議生成到達率
	•	Docs出力率（社内に回っている兆候）
	•	再生成回数（差し戻し価値）
	•	採用/問い合わせクリック率

⸻

## 15. 次の実装タスク（最短順）
	1.	DB作成（DDL） + Seed入力UI（最低限CSVでも可）
	2.	収集ジョブ（取得→RAW→chunk）
	3.	facts抽出（Must系＋価格＋連携＋セキュリティ優先）
	4.	/recommend（Mustフィルタ＋スコアリング＋Explain）
	5.	比較UI + /generate/proposal（Markdown）
	6.	Google Docs生成（OAuth + Docs API）

⸻

付録：稟議1枚テンプレ（Markdown）

''' Markdown
# DXツール導入申請（{primary_category_jp}）：{solution_name}

## 1. 背景（現状と課題）
- 対象部門：{department}
- 現状：{current_state_summary}
- 課題：
{problem_bullets}

## 2. 導入目的（狙いとKPI）
- 目的：{goal_summary}
- KPI（例）：
  - {kpi_1}
  - {kpi_2}
  - {kpi_3}

## 3. 選定要件（Must / Should）
### Must（満たさない場合は採用不可）
{must_list}

### Should（満たすほど望ましい）
{should_list}

## 4. 候補比較（上位3件の結論）
> ※比較は公開情報および最終確認日時に基づく。詳細はベンダー確認事項を参照。

| 項目 | {solution_name}（推奨） | {alt1_name} | {alt2_name} |
|---|---|---|---|
| 概算費用 | {primary_price_range} | {alt1_price_range} | {alt2_price_range} |
| SSO | {primary_sso} | {alt1_sso} | {alt2_sso} |
| 監査ログ | {primary_auditlog} | {alt1_auditlog} | {alt2_auditlog} |
| 主要連携 | {primary_integrations} | {alt1_integrations} | {alt2_integrations} |
| 導入難易度 | {primary_impl_ease} | {alt1_impl_ease} | {alt2_impl_ease} |
| 運用負荷 | {primary_ops_load} | {alt1_ops_load} | {alt2_ops_load} |
| 根拠（代表URL） | {primary_evidence_url} | {alt1_evidence_url} | {alt2_evidence_url} |

## 5. 推奨理由（{solution_name} を推す理由）
1. {reason_1}（根拠：{reason_1_url}）
2. {reason_2}（根拠：{reason_2_url}）
3. {reason_3}（根拠：{reason_3_url}）

## 6. 懸念点と対策（差し戻し防止）
- 懸念点：
  - {concern_1}
  - {concern_2}
- 対策：
  - {mitigation_1}
  - {mitigation_2}

## 7. 概算費用（TCOの見立て）
- 初期費用：{cost_initial}
- 月額費用：{cost_monthly}
- 年額換算：{cost_annual}
- 運用工数（目安）：{ops_hours_per_month} 時間/月
- 備考：{cost_notes}

## 8. 導入ステップ（最短ルート）
1. ベンダー確認（確認事項の回答取得）：{step1_duration}
2. PoC/トライアル（撤退条件を事前定義）：{step2_duration}
3. 本番導入（移行/権限設計/教育）：{step3_duration}
4. 定着化（運用ルール/会議体/改善）：{step4_duration}

## 9. セキュリティ・リスク（確認済み/要確認）
- 確認済み：
{security_confirmed_list}
- 要確認（ベンダー回答待ち）：
{security_to_confirm_list}

## 10. ベンダー確認事項（質問リスト）
{questions_to_vendor}

## 11. 承認依頼
上記の通り、{solution_name} の導入を申請します。  
承認後、{next_action_summary} を実施します。

---
最終確認日：{last_verified_at}  
作成者：{requester_name}

⸻
'''