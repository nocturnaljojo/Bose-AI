---
description: Generate a Rork handoff prompt from the current project context
argument-hint: [optional mobile app idea]
---

Run:

!`bose rork prompt`

Then read `.bose/rork-context/RORK_PROMPT.md` and tighten it for Rork:

1. Preserve the current project backend, auth, and data model
2. Make the mobile screens concrete
3. Keep Rork as an optional scaffold path, not the source of truth
4. Include the user-provided mobile app idea from `$ARGUMENTS`, if present
