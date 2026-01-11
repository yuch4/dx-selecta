---
name: steering
description: 作業指示ごとに .steering/ 配下へ requirements/design/tasklist を作成し、tasklist.md を唯一の進捗ソースとして実装を推進する。計画（作成）/実装（ループ）/振り返り（記録）の3モードで運用する。詳細ルールは ./reference.md、テンプレは ./templates/* を参照。
---

# Steering Skill（骨格）

## 目的
- .steering/ に「今回の作業の要求・設計・タスク」を必ず残す
- tasklist.md を進捗の唯一の正（Single Source of Truth）にする

## 参照（同ディレクトリ）
- 詳細: `./reference.md`
- テンプレ: `./templates/requirements.md`, `./templates/design.md`, `./templates/tasklist.md`

## 入出力
- 入力: ユーザーの指示（機能名/変更内容）、既存 docs（PRD/設計/アーキ等）
- 出力: `.steering/<YYYYMMDD>-<slug>/requirements.md`
        `.steering/<YYYYMMDD>-<slug>/design.md`
        `.steering/<YYYYMMDD>-<slug>/tasklist.md`

## モード
1. **plan**: 3ファイル作成 + tasklist具体化
2. **implement**: tasklist を先頭から消化し、都度更新（未完了を残さない）
3. **reflect**: tasklist の振り返り欄を更新（全タスク完了後のみ）

## 手順（骨格）
- plan: 既存 docs を読んで方針を掴み、テンプレから3ファイルを生成
- implement: tasklist を読み→未完了を1つ選び→実装→tasklist更新を1タスクごとに繰り返す
- reflect: 全タスク完了を確認してから振り返りを記録