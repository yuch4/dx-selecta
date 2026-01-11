# Copilot Instructions (Repo-wide)


1. 会話言語は日本語
2. 回答する際は必ず先頭に「💡」をつけてください
3. 新しいSkillやPromptを作成・修正する場合は、必ず `.github/SKILLS_VS_PROMPTS.md` を参照してベストプラクティスに従うこと

## Operating rules
- Follow existing patterns in this repo (search before creating new patterns)
- Keep diffs small and focused; avoid refactors unless required
- Prefer clear, maintainable code over clever code
- Never include secrets; don’t log sensitive data
## Branch-based development (Vercel連携)
**※ Vercelデプロイ後に適用（デプロイ前はmain直接pushでOK）**
- mainブランチへの直接pushは禁止（本番環境に即時反映されるため）
- 新機能・修正は必ずfeatureブランチで作業し、PRを作成する
- PRをpushすると Vercel Preview が自動デプロイされる
- Preview環境で動作確認後、PRをマージ → 本番反映
## Quality gates
- If scripts exist, run: lint / typecheck / tests (or the closest equivalents)
- When changing behavior, add or update tests when feasible
- Explain risky changes and propose rollback strategy when relevant

## Communication
- When you must ask a question, ask only the minimum needed and proceed with best assumptions otherwise
