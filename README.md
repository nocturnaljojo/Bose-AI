# Bose-AI

Bose (n., Fijian): a council. Now in your CLI.

Bose-AI coordinates a small council of AI systems from your terminal and Claude Code. It is designed for building web apps and mobile apps with a practical workflow:

- Claude Code remains the orchestrator and editor.
- Gemini can help with broad repo analysis.
- Codex can help with focused code generation and refactor proposals.
- OpenAI can help with reasoning, synthesis, and writing.
- Grok can be wired as an optional xAI consultation lane.
- Rork is supported as an optional mobile scaffold handoff, not a core dependency.

## Install Locally

From this repo:

```bash
npm link
bose --help
```

Or run without linking:

```bash
node ./bin/bose.mjs --help
```

## Provider Setup

Copy `.env.example` to `.env` in your shell environment or set these variables globally:

```bash
OPENAI_API_KEY=...
XAI_API_KEY=...
BOSE_GEMINI_BIN=gemini
BOSE_CODEX_BIN=codex
```

Gemini and Codex use local CLIs. OpenAI and Grok use API keys.

Check your local setup with:

```bash
bose doctor
```

## Core Commands

```bash
bose providers
bose doctor
bose ask gemini "Map this repo's auth flow."
bose council "Should this mobile app use Expo Router?"
bose mobile context
bose mobile plan
bose mobile init --name my-app --dir apps/mobile
bose mobile audit --dir apps/mobile
bose rork prompt
bose rork audit --dir rork-import
bose mcp
```

## Mobile Workflow

Bose-AI owns the mobile build. The default path is direct Expo/React Native:

```text
web app context
  -> bose mobile context
  -> mobile plan
  -> Expo app in apps/mobile
  -> device testing
  -> EAS/app store release
```

Rork is optional:

```text
web app context
  -> bose rork prompt
  -> Rork hosted builder
  -> GitHub export/sync
  -> bose rork import
  -> audit and integrate
```

## Claude Code MCP

Add Bose-AI as an MCP server in Claude Code using the command:

```bash
bose mcp
```

The server exposes tools for provider consultation and mobile/Rork context generation.

## Project Docs

- `docs/ARCHITECTURE.md`
- `docs/ROUTING.md`
- `docs/MOBILE.md`
