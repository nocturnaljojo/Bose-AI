---
description: Use when working with Bose-AI as a Claude Code plugin or CLI, coordinating model-provider routing, mobile context generation, direct Expo builds, or optional Rork handoffs.
---

# Bose-AI

Bose-AI is both a standalone CLI (`bose`) and a Claude Code plugin. Its purpose is to let Claude Code orchestrate provider consults and app-building workflows from one project folder.

## Core Mental Model

The user opens a project folder, runs `claude`, and expects Claude Code plus Bose-AI to reason about that same project. Keep all commands rooted in the current working directory unless the user explicitly points to another project.

```text
VS Code terminal
  -> claude
    -> Bose-AI plugin/MCP tools
      -> Codex, Gemini, OpenAI, Grok, DeepSeek, mobile context, Rork handoff
```

## Prefer These Surfaces

- Use `bose doctor` to check local setup.
- Use `bose mobile context` before planning mobile work.
- Use `bose mobile plan` before creating or editing Expo/React Native code.
- Use `bose rork prompt` only when the user wants Rork as an optional visual scaffold.
- Use `bose council "<question>"` only when a manual multi-provider comparison is worth the delay.
- Use `/bose-ai:consensus` when the user wants concise review with `SEND IT`, `REVISE`, or `BLOCK`.
- Use `/bose-ai:orchestrate` for the one-terminal agent workflow where Claude Code plans, consults Codex and DeepSeek, then executes.
- Do not ask the user to run `bose mcp` manually during normal Claude Code use. Claude Code starts the MCP server when the plugin is connected.

## Provider Routing

- Gemini: broad repo reads and large-context architecture questions.
- Codex: focused code generation and refactor proposals.
- OpenAI: reasoning, synthesis, product writing, UX copy.
- Grok: optional xAI lane when explicitly useful or requested.
- DeepSeek: optional reasoning and code-focused consultation lane.
- Rork: hosted mobile scaffold workflow through prompt and GitHub import, not a core dependency.

## Mobile Workflow

Default to direct Expo/React Native builds. Rork is optional.

```text
current app repo
  -> bose mobile context
  -> bose mobile plan
  -> direct Expo build in apps/mobile
  -> device testing
```

Optional Rork lane:

```text
current app repo
  -> bose rork prompt
  -> Rork hosted builder
  -> GitHub export
  -> bose rork import
  -> bose rork audit
```

## Development Checks

For Bose-AI repo changes, run:

```bash
npm run check
npm run smoke
```

If plugin structure changes, also test locally with:

```bash
claude --plugin-dir .
```
