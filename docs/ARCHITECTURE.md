# Bose-AI Architecture

Bose-AI is a CLI and Claude Code integration for coordinating a small council of AI systems while building web and mobile apps.

## Core Shape

```text
Claude Code
  |
  | calls
  v
Bose-AI CLI / MCP server
  |
  | routes to
  v
Provider adapters
  - Gemini for broad repo/context reads
  - Codex for focused code generation and refactor proposals
  - OpenAI for reasoning, synthesis, and writing
  - Grok for optional xAI consultation
  - DeepSeek for optional reasoning and code-focused consultation
```

The CLI is the user-facing control surface. The MCP server is the autonomous tool surface that Claude Code can call mid-task.

## Council Mode

Council Mode is the orchestrator-agent pattern:

```text
User
  -> Claude Code orchestrator
    -> Codex implementation consult
    -> DeepSeek critique consult
  -> Claude Code executes, checks, and reports
```

The other providers remain available, but Codex plus DeepSeek is the default implementation council.

## Consensus Gate

The consensus gate keeps model consultation terse:

```text
Proposal
  -> Gemini/Codex/DeepSeek verdicts
  -> SEND IT, MAJORITY SEND IT, REVISE, or BLOCK
```

Long transcripts are intentionally hidden. If reviewers disagree, Claude Code extracts only the missing points, revises the plan, and runs one final review pass.

## Why One MCP Server

Use one `bose-ai` MCP server with multiple tools instead of one server per model. This keeps auth, logging, rate limits, and tool descriptions in one place.

## Rork Position

Rork is not a peer provider in the same way as Codex, Gemini, OpenAI, Grok, or DeepSeek. Treat it as an optional mobile scaffold workflow:

```text
Existing web app
  -> bose rork context / bose rork prompt
  -> Rork hosted builder
  -> GitHub export/sync
  -> bose rork import
  -> Claude Code/Codex/Gemini audit and integrate
```

Bose-AI should be able to build mobile apps directly without Rork. Rork remains useful for fast visual prototypes and founder demos.

## Mobile App Target

The default mobile target is Expo/React Native:

```text
apps/
  web/
  mobile/

packages/
  api/
  auth/
  types/
  config/
  design-tokens/
```

Bose-AI extracts the web app's product context, data model, auth, API contract, design tokens, and screenshots into a mobile context pack. That pack drives either a direct Expo build or an optional Rork handoff.
