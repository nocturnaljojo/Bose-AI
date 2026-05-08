import { commandExists, runCommand } from "./process.mjs";
import { askDeepSeek } from "../providers/deepseek.mjs";

const DEFAULT_TIMEOUT_MS = 90_000;

const PROVIDERS = [
  { name: "Gemini", run: checkGemini, required: true },
  { name: "Codex", run: checkCodex, required: false },
  { name: "DeepSeek", run: checkDeepSeek, required: true }
];

export async function runCheck(options = {}) {
  const io = options.io || process;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const cwd = options.cwd || process.cwd();
  const results = [];

  for (const provider of PROVIDERS) {
    const raw = await provider.run({ timeoutMs, cwd }).catch((error) => ({
      ok: false,
      reason: shortReason(error)
    }));
    const entry = {
      name: provider.name,
      required: provider.required,
      ok: Boolean(raw.ok),
      warn: !raw.ok && !provider.required,
      reason: raw.reason
    };
    results.push(entry);
    io.stdout.write(formatLine(entry) + "\n");
  }

  return {
    ok: results.every((entry) => entry.ok || entry.warn),
    results
  };
}

function formatLine(entry) {
  if (entry.ok) {
    return `${entry.name}: OK`;
  }
  const reason = entry.reason || "unknown error";
  if (entry.name === "Codex" && entry.warn) {
    return `Codex: WARN - optional Codex CLI ${reason}; use Claude Code Codex plugin if available`;
  }
  if (entry.warn) {
    return `${entry.name}: WARN - ${reason}`;
  }
  return `${entry.name}: FAIL - ${reason}`;
}

async function checkGemini({ timeoutMs, cwd }) {
  const bin = process.env.BOSE_GEMINI_BIN || "gemini";
  if (!commandExists(bin)) {
    return { ok: false, reason: `${bin} not on PATH` };
  }

  try {
    const result = await runCommand(bin, ["-p", "Reply only GEMINI OK"], {
      cwd,
      timeoutMs,
      env: { GEMINI_CLI_TRUST_WORKSPACE: "true" }
    });
    if (/GEMINI\s+OK/i.test(result.stdout)) {
      return { ok: true };
    }
    return { ok: false, reason: "no GEMINI OK token in output" };
  } catch (error) {
    return { ok: false, reason: shortReason(error) };
  }
}

async function checkCodex({ timeoutMs, cwd }) {
  const bin = process.env.BOSE_CODEX_BIN || "codex";
  if (!commandExists(bin)) {
    return { ok: false, reason: `${bin} not on PATH` };
  }

  try {
    const result = await runCommand(bin, ["exec", "Reply only CODEX OK"], {
      cwd,
      timeoutMs,
      allowNonZeroExit: true
    });
    if (/CODEX\s+OK/i.test(result.stdout)) {
      return { ok: true };
    }
    if (result.code !== 0) {
      return { ok: false, reason: `exit ${result.code}: ${shortText(result.stderr) || "no CODEX OK token"}` };
    }
    return { ok: false, reason: "no CODEX OK token in output" };
  } catch (error) {
    const message = error?.message || String(error || "");
    if (/^Command timed out/i.test(message)) {
      return { ok: false, reason: "timed out" };
    }
    return { ok: false, reason: shortReason(error) };
  }
}

async function checkDeepSeek({ timeoutMs, cwd }) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return { ok: false, reason: "DEEPSEEK_API_KEY missing" };
  }

  try {
    const result = await withTimeout(
      askDeepSeek("Reply only DEEPSEEK OK", { cwd }),
      timeoutMs,
      "DeepSeek call timed out"
    );
    if (/DEEPSEEK\s+OK/i.test(result.text || "")) {
      return { ok: true };
    }
    return { ok: false, reason: "no DEEPSEEK OK token in response" };
  } catch (error) {
    return { ok: false, reason: shortReason(error) };
  }
}

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function shortReason(error) {
  const message = error?.message || String(error || "");
  return shortText(message) || "unknown error";
}

function shortText(text) {
  const first = String(text || "").trim().split(/\r?\n/)[0] || "";
  return first.length > 160 ? first.slice(0, 157) + "..." : first;
}

export function checkHelpText() {
  return `Usage:
  bose check        Run a short health check against the configured providers.
  bose check --help

Required Bose-AI provider checks:
  - Gemini   (must reply "GEMINI OK")
  - DeepSeek (must reply "DEEPSEEK OK"; needs DEEPSEEK_API_KEY)

Optional/advisory check:
  - Codex CLI is checked but reported as a warning rather than a failure.
    Codex may also be available through the Claude Code Codex plugin, so a
    Codex CLI timeout or missing binary should not fail the overall check.

What it does:
  - Calls each provider with a tiny prompt that should echo "<NAME> OK".
  - Sets GEMINI_CLI_TRUST_WORKSPACE=true for the Gemini child process.
  - Treats Codex as OK if stdout contains "CODEX OK" even with nonfatal stderr warnings.

Exit code:
  0 if Gemini and DeepSeek pass, even if the Codex CLI warns.
  Non-zero if Gemini or DeepSeek fails.
`;
}
