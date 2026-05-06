import { askCodex, codexAvailable } from "./codex.mjs";
import { askDeepSeek, deepseekAvailable } from "./deepseek.mjs";
import { askGemini, geminiAvailable } from "./gemini.mjs";
import { askGrok, grokAvailable } from "./grok.mjs";
import { askOpenAI, openaiAvailable } from "./openai.mjs";

const providers = [
  {
    name: "gemini",
    description: "Large-context repo analysis through Gemini CLI.",
    available: geminiAvailable,
    ask: askGemini
  },
  {
    name: "codex",
    description: "Focused code generation and refactor proposals through Codex CLI.",
    available: codexAvailable,
    ask: askCodex
  },
  {
    name: "openai",
    aliases: ["gpt", "chatgpt"],
    description: "OpenAI API for reasoning, writing, and synthesis.",
    available: openaiAvailable,
    ask: askOpenAI
  },
  {
    name: "grok",
    description: "xAI API for Grok consultation.",
    available: grokAvailable,
    ask: askGrok
  },
  {
    name: "deepseek",
    description: "DeepSeek API for reasoning and code-focused consultation.",
    available: deepseekAvailable,
    ask: askDeepSeek
  }
];

export function listProviders() {
  return providers;
}

export async function callProvider(name, prompt, options = {}) {
  const provider = providers.find((entry) => entry.name === name || entry.aliases?.includes(name));
  if (!provider) {
    throw new Error(`Unknown provider: ${name}`);
  }
  if (!provider.available()) {
    throw new Error(`Provider is not configured: ${provider.name}`);
  }
  return provider.ask(prompt, options);
}
