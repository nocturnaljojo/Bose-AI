# Claude Code Plugin

Bose-AI is packaged as a Claude Code plugin as well as a standalone CLI.

## What The Plugin Adds

- Plugin commands:
  - `/bose-ai:align`
  - `/bose-ai:doctor`
  - `/bose-ai:consensus`
  - `/bose-ai:orchestrate`
  - `/bose-ai:mobile-context`
  - `/bose-ai:mobile-plan`
  - `/bose-ai:rork-prompt`
  - `/bose-ai:ui-review`
  - `/bose-ai:council`
- Plugin skill:
  - `bose-ai`
- MCP server:
  - `bose-ai`
- MCP tools:
  - `bose_gemini_consult`
  - `bose_codex_consult`
  - `bose_openai_consult`
  - `bose_grok_consult`
  - `bose_deepseek_consult`
  - `bose_mobile_context`
  - `bose_rork_handoff`

## Local Development Test

From the Bose-AI repo root:

```bash
claude --plugin-dir .
```

Inside Claude Code:

```text
/help
/mcp
/bose-ai:align
/bose-ai:doctor
/bose-ai:consensus Review this implementation plan.
/bose-ai:orchestrate Explain how this project should build mobile apps.
/bose-ai:mobile-context
/bose-ai:ui-review Review the dashboard layout.
```

When editing plugin files during a Claude Code session, run:

```text
/reload-plugins
```

## Standalone MCP Setup

If you do not use the plugin loader, you can still register Bose-AI directly:

```powershell
claude mcp add --transport stdio --scope local bose-ai -- node "C:\Users\jtdra\OneDrive\Documents\New project\bin\bose.mjs" mcp
```

Then check:

```powershell
claude mcp list
```

## Intended User Flow

```text
cd C:\path\to\app
code .
claude --plugin-dir C:\path\to\Bose-AI
```

Then inside Claude Code:

```text
/bose-ai:doctor
/bose-ai:mobile-context
```

For normal use after marketplace packaging, the user should be able to install the plugin once and then run:

```text
cd C:\path\to\app
claude
```

with Bose-AI available inside Claude Code.

## Alignment Workflow

`/bose-ai:align` is the senior-dev checkpoint:

```text
authority files -> current state -> drift check -> one recommended next task
```

Use it before starting new work, after long sessions, or when the user is worried the project is drifting.

## UI Review Workflow

`/bose-ai:ui-review` uses browser evidence before model opinion:

```text
Playwright/browser screenshots + console/network signals -> UI packet -> concise model verdicts
```

Gemini reviews visual/product feel, Codex reviews implementation simplicity, and DeepSeek reviews risks/accessibility/regressions.

## Council Mode

`/bose-ai:orchestrate` is the one-terminal agent workflow. It is designed for this interaction:

```text
User -> Claude Code -> Codex consult + DeepSeek critique -> Claude Code executes
```

Claude Code remains responsible for file edits and checks. Provider tools provide strategy, critique, and alternatives.

## Consensus Gate

`/bose-ai:consensus` is the short review loop:

```text
Claude proposal -> Gemini/Codex/DeepSeek review -> SEND IT / REVISE / BLOCK
```

If all available reviewers agree, Claude Code should answer only `SEND IT`. If they disagree, it should state the missing points, revise once, run a final review pass, then return the shortest final verdict.
