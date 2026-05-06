# Routing Rules

Use conservative delegation. Bose-AI should not turn every task into a four-model meeting.

| Task | Default Route | Reason |
| --- | --- | --- |
| Broad repo scan, architecture map, "where is this used?" | Gemini | Large-context review |
| Focused code generation or refactor proposal | Codex | Strong code-edit reasoning |
| UX copy, README prose, synthesis, business writing | OpenAI | Writing and reasoning |
| xAI/Grok-specific second opinion | Grok | Optional provider lane |
| Direct mobile implementation | Claude Code + Codex | Keep code changes local and reviewable |
| Mobile visual prototype | Rork handoff | Fast Expo/React Native scaffold |

## Tool Description Strategy

MCP tool descriptions should make delegation rare and deliberate:

- Use Gemini only when broad context is genuinely required.
- Use Codex for focused implementation proposals, not uncontrolled repo rewrites.
- Use OpenAI for writing, synthesis, and product reasoning.
- Use Grok only when explicitly useful or requested.
- Use Rork only when the user wants a hosted visual mobile scaffold.

## Council Mode

`bose council` is manual. It asks configured providers the same question and prints their responses. Claude Code should synthesize the answer after reading the outputs.
