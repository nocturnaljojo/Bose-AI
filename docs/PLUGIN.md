# Claude Code Plugin

Bose-AI is packaged as a Claude Code plugin as well as a standalone CLI.

## What The Plugin Adds

- Plugin commands:
  - `/bose-ai:doctor`
  - `/bose-ai:orchestrate`
  - `/bose-ai:mobile-context`
  - `/bose-ai:mobile-plan`
  - `/bose-ai:rork-prompt`
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
/bose-ai:doctor
/bose-ai:orchestrate Explain how this project should build mobile apps.
/bose-ai:mobile-context
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

## Council Mode

`/bose-ai:orchestrate` is the one-terminal agent workflow. It is designed for this interaction:

```text
User -> Claude Code -> Codex consult + DeepSeek critique -> Claude Code executes
```

Claude Code remains responsible for file edits and checks. Provider tools provide strategy, critique, and alternatives.
