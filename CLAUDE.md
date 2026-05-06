# Bose-AI Project Guide

This repository is Bose-AI: a standalone Node.js CLI plus Claude Code plugin/MCP server for coordinating AI model consults and app-building workflows from one project folder.

## What This Project Is

- CLI binary: `bose`
- Entry point: `bin/bose.mjs`
- CLI router: `src/cli.mjs`
- MCP server: `src/mcp/server.mjs`
- Provider adapters: `src/providers/`
- Repo/mobile scanners: `src/lib/`
- Claude Code plugin manifest: `.claude-plugin/plugin.json`
- Plugin commands: `commands/`
- Plugin skill: `skills/bose-ai/SKILL.md`

## Normal Commands

```bash
npm link
bose doctor
bose providers
bose mobile context
bose rork prompt
```

For checks:

```bash
npm run check
npm run smoke
```

## MCP Rule

Do not tell users to run `bose mcp` manually for normal use. `bose mcp` is the stdio MCP server process that Claude Code starts automatically when configured.

Manual MCP smoke test:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node ./bin/bose.mjs mcp
```

## Plugin Rule

Bose-AI should feel like a Claude Code plugin, not a VS Code fork. VS Code remains the editor. Claude Code runs in the terminal. Bose-AI provides:

- Plugin commands such as `/bose-ai:mobile-context`
- Consensus gate command: `/bose-ai:consensus`
- Council Mode command: `/bose-ai:orchestrate`
- MCP tools such as `bose_mobile_context`
- The standalone `bose` CLI

During local plugin development, test with:

```bash
claude --plugin-dir .
```

## Mobile Rule

The mobile build target is Expo/React Native by default. Rork is optional and should be treated as a scaffold/handoff lane, not the source of truth.

Use:

```bash
bose mobile context
bose mobile plan
```

before implementing mobile code.

## Provider Routing

- Gemini: broad repo and large-context analysis.
- Codex: focused codegen and refactor proposals.
- OpenAI: reasoning, synthesis, UX copy, writing.
- Grok: optional xAI lane.
- DeepSeek: optional reasoning and code-focused consultation.
- Rork: optional hosted mobile prototype/import workflow.

Provider warnings in `bose doctor` are acceptable unless the user is trying to use that provider.

## Council Mode Rule

`/bose-ai:orchestrate` is the intended one-terminal workflow. Claude Code should:

1. Plan the work.
2. Consult Codex for implementation/refactor strategy.
3. Consult DeepSeek for critique and risk review.
4. Synthesize the council.
5. Edit files itself.
6. Run checks.

Do not frame this as separate terminal sessions.

## Consensus Gate Rule

When using `/bose-ai:consensus`, keep output terse:

- If reviewers agree, say `SEND IT`.
- If reviewers mostly agree, say `MAJORITY SEND IT: <brief note>`.
- If something is missing, say `REVISE: <brief missing points>`.
- If unsafe, say `BLOCK: <brief reason>`.

Do not show long model transcripts unless the user explicitly asks.
