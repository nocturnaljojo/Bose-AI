import { commandExists, runCommand } from "../lib/process.mjs";

export function codexAvailable() {
  return commandExists(process.env.BOSE_CODEX_BIN || "codex");
}

export async function askCodex(prompt, options = {}) {
  const bin = process.env.BOSE_CODEX_BIN || "codex";
  const result = await runCommand(bin, ["exec", prompt], {
    cwd: options.cwd,
    timeoutMs: options.timeoutMs || 180_000
  });
  return {
    provider: "codex",
    text: result.stdout
  };
}
