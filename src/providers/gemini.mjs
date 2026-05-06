import { commandExists, runCommand } from "../lib/process.mjs";

export function geminiAvailable() {
  return commandExists(process.env.BOSE_GEMINI_BIN || "gemini");
}

export async function askGemini(prompt, options = {}) {
  const bin = process.env.BOSE_GEMINI_BIN || "gemini";
  const result = await runCommand(bin, ["-p", prompt], {
    cwd: options.cwd,
    timeoutMs: options.timeoutMs || 180_000
  });
  return {
    provider: "gemini",
    text: result.stdout
  };
}
