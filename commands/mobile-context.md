---
description: Generate and inspect a mobile context pack for the current project
argument-hint: [optional focus]
---

Run:

!`bose mobile context`

Then read `.bose/mobile-context/CONTEXT_PACK.md` and summarize:

1. Detected app type and framework
2. Auth, backend, API, data model, and design-token signals
3. What is missing before starting an Expo/React Native build
4. The next mobile implementation step

If the user provided a focus in `$ARGUMENTS`, apply it to the summary and next step.
