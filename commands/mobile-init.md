---
description: Plan and (optionally) scaffold an Expo/React Native app for this repo
argument-hint: [optional dir or template hints, e.g. "apps/mobile tabs"]
---

Run:

!`bose mobile init`

Then read `.bose/mobile-setup/SETUP_NOTES.md` and:

1. Confirm the target directory, template, and any blockers reported in the preflight.
2. If the user wants to scaffold now, suggest re-running with `--run` (and `--force` only if the target is non-empty on purpose).
3. After scaffolding, walk the user through the five next steps from the notes: mobile context, design tokens, env wiring, auth/API reuse, device verification.
4. Offer to run `bose mobile context` next so the new app inherits the web product's signals.

If `$ARGUMENTS` is present, treat it as a hint for `--dir` and/or `--template` and re-run accordingly.
