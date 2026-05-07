---
description: Align the project: check authority files, drift, current state, and the next best task
argument-hint: [optional focus]
---

Align this project before doing more work. Optional focus:

`$ARGUMENTS`

Use this workflow:

1. Inspect authority files first:
   - `CLAUDE.md`
   - `README.md`
   - `docs/`
   - roadmap/plan/task files if present
   - `package.json`
   - `.bose/` context if relevant
2. Inspect current execution state:
   - `git status --short --branch`
   - latest 3 commits
   - uncommitted diff summary
   - available scripts/checks
3. Produce a short alignment report:
   - `State:` 3-5 bullets
   - `Drift:` none, warning, or blocker
   - `Authority:` files that control direction
   - `Recommended next task:` one task only
   - `Why this task:` 1-2 bullets
   - `Alternatives:` max 2, only if useful
4. Do not implement yet.
5. Ask: `Proceed to consensus review?`
6. If the user agrees, run the consensus gate on the recommended task.
7. If the council returns `SEND IT` or `MAJORITY SEND IT`, ask whether to execute with `/bose-orchestrate`.

Keep output concise. This command is for direction, not implementation.
