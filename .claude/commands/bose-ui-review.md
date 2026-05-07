---
description: Review UI with browser evidence, screenshots, and concise model consensus
argument-hint: <route, screen, or UI goal>
---

Review the UI for:

`$ARGUMENTS`

Use a browser-evidence workflow. Prefer Playwright if available; otherwise use the available browser automation tool in this Claude Code environment.

Workflow:

1. Identify the app and how to run it:
   - inspect `package.json` scripts
   - identify framework and routes/screens
   - do not start a server if one is already running
2. Capture objective evidence:
   - desktop screenshot
   - mobile screenshot
   - console errors
   - failed network requests
   - obvious layout overflow/cut-off text
   - basic accessibility issues if tooling is available
3. Create a short UI packet for review:
   - route/screen
   - screenshot paths
   - relevant component/CSS files
   - design tokens/theme files
   - user goal
4. Ask reviewers with roles:
   - Gemini: visual/UI composition and product feel
   - Codex: implementation simplicity and component/CSS changes
   - DeepSeek: risk critique, edge cases, accessibility, regressions
5. Reviewers must answer only:
   - `SEND IT`
   - `REVISE: <one-line issue>`
   - `BLOCK: <one-line reason>`
6. If there is disagreement, list only the missing points and revise the UI plan once.
7. Execute only after `SEND IT` or `MAJORITY SEND IT`, unless the user explicitly asks for exploration only.
8. After edits, rerun browser evidence and report:
   - before/after screenshots
   - checks run
   - final verdict

Keep the answer short. Do not include long model transcripts.
