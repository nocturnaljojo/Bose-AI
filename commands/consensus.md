---
description: Consensus Gate: review a plan with Gemini, Codex, and DeepSeek, then return SEND IT or concise blockers
argument-hint: <plan or decision to review>
---

Review this plan or decision:

`$ARGUMENTS`

Use the Bose-AI consensus gate. Keep the whole exchange short.

Protocol:

1. State the proposal in one sentence.
2. Ask available reviewers for a verdict:
   - Gemini: architecture/context review
   - Codex: implementation/code review
   - DeepSeek: critique/risk review
3. Each reviewer must answer in this format only:
   - `SEND IT` if they agree
   - `REVISE: <one-line missing point>` if something is missing
   - `BLOCK: <one-line reason>` if the plan is unsafe or wrong
4. If a reviewer is unavailable, mark it `UNAVAILABLE: <provider>`.
5. If all available reviewers say `SEND IT`, reply only:
   - `SEND IT`
6. If there is disagreement, output only:
   - `Verdict: REVISE` or `Verdict: BLOCK`
   - `Missing:` with the shortest possible bullet list
   - `Revised plan:` with the corrected plan
7. Run one final review pass on only the revised points.
8. Final output must be one of:
   - `SEND IT`
   - `MAJORITY SEND IT: <brief note>`
   - `REVISE: <brief missing points>`
   - `BLOCK: <brief reason>`

Rules:

- Do not include long model transcripts.
- Do not call every provider if the task is trivial.
- Majority is enough unless a blocker identifies data loss, security risk, broken tests, or user-facing regression.
- Claude Code remains the final orchestrator.
