# Mobile Build Workflow

Bose-AI treats mobile as a first-class build target.

## Direct Expo Path

```bash
bose mobile context
bose mobile plan
bose mobile init --name my-app --dir apps/mobile
bose mobile audit --dir apps/mobile
```

Then build the app in `apps/mobile` with Expo Router, shared API/types/auth config, and the repo's design tokens.

## Context First

Before code generation, produce:

- `.bose/mobile-context/CONTEXT_PACK.md`
- `.bose/mobile-context/DATA_MODEL.md`
- `.bose/mobile-context/API_CONTRACT.md`
- `.bose/mobile-context/MOBILE_SCREENS.md`
- `.bose/mobile-context/DESIGN_TOKENS.json`

These files tell Claude Code, Codex, Gemini, or Rork what the mobile app must preserve from the web app.

## Rork Path

```bash
bose rork context
bose rork prompt
# paste/import RORK_PROMPT.md into Rork
bose rork import https://github.com/owner/rork-generated-app --run
bose rork audit --dir rork-import
```

After import, audit the Expo app before integrating:

- package and route structure
- auth/backend choices
- data model compatibility
- design token compatibility
- device testing requirements

## Decision Rule

Use direct Expo for production apps. Use Rork when a quick visual scaffold is worth the extra import/audit step.
