---
description: Council Mode: plan, consult Codex and DeepSeek, then execute in one Claude Code session
argument-hint: <task>
---

You are the Bose-AI orchestrator for this task:

`$ARGUMENTS`

Work in one Claude Code session. Do not ask the user to open separate terminals for Codex, DeepSeek, Gemini, OpenAI, or Grok unless a provider is missing credentials and the task cannot proceed without it.

Follow this sequence:

1. Restate the user task in one or two sentences.
2. Inspect the repo just enough to understand the relevant files, commands, and risk.
3. Run `bose providers` to confirm which Bose-AI providers are configured.
4. Create a short execution plan before editing files.
5. Use the consensus gate:
   - Gemini reviews architecture/context when available.
   - Codex reviews implementation/code when available.
   - DeepSeek reviews critique/risk when available.
6. Each reviewer must return only `SEND IT`, `REVISE: <one-line missing point>`, or `BLOCK: <one-line reason>`.
7. If all available reviewers agree, say only `SEND IT` and proceed.
8. If they disagree, state only the missing points, revise the plan, and run one final review pass on the revised points.
9. Majority approval is enough unless a blocker identifies data loss, security risk, broken tests, or user-facing regression.
10. Keep the council summary short:
   - `SEND IT`
   - `MAJORITY SEND IT: <brief note>`
   - `REVISE: <brief missing points>`
   - `BLOCK: <brief reason>`
11. Make the code changes yourself in Claude Code.
12. Run the project's relevant checks.
13. Report:
   - files changed
   - checks run and result
   - what remains or what provider setup is missing

Keep delegation conservative. Do not call every provider by default. For normal implementation tasks, Codex plus DeepSeek is the default council.
