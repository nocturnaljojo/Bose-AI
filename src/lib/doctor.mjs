import { commandExists, runCommand } from "./process.mjs";

const REQUIRED_COMMANDS = [
  {
    name: "node",
    label: "Node.js",
    reason: "Required to run Bose-AI.",
    minimumMajor: 20
  },
  {
    name: "npm",
    label: "npm",
    reason: "Required for local install/link workflows."
  },
  {
    name: "git",
    label: "Git",
    reason: "Required for repo, Rork import, and publish workflows."
  }
];

const OPTIONAL_COMMANDS = [
  {
    name: "codex",
    label: "Codex CLI",
    reason: "Enables `bose ask codex` and the Codex MCP consult tool."
  },
  {
    name: "gemini",
    label: "Gemini CLI",
    env: "BOSE_GEMINI_BIN",
    reason: "Enables large-context Gemini consultation."
  },
  {
    name: "claude",
    label: "Claude Code CLI",
    reason: "Useful when running Bose-AI inside Claude Code workflows."
  },
  {
    name: "npx",
    label: "npx",
    reason: "Used by `bose mobile init --run` to scaffold Expo apps."
  },
  {
    name: "eas",
    label: "EAS CLI",
    reason: "Optional for mobile preview and production builds."
  }
];

const ENV_CHECKS = [
  {
    name: "OPENAI_API_KEY",
    label: "OpenAI API key",
    reason: "Enables `bose ask openai` and the OpenAI MCP consult tool."
  },
  {
    name: "XAI_API_KEY",
    label: "xAI API key",
    reason: "Enables `bose ask grok` and the Grok MCP consult tool."
  },
  {
    name: "DEEPSEEK_API_KEY",
    label: "DeepSeek API key",
    reason: "Enables `bose ask deepseek` and the DeepSeek MCP consult tool."
  }
];

export async function buildDoctorReport(cwd = process.cwd()) {
  const checks = [];

  for (const command of REQUIRED_COMMANDS) {
    checks.push(await commandCheck(command, cwd, "required"));
  }

  for (const command of OPTIONAL_COMMANDS) {
    checks.push(await commandCheck(command, cwd, "optional"));
  }

  for (const env of ENV_CHECKS) {
    checks.push(envCheck(env));
  }

  checks.push(await gitRemoteCheck(cwd));

  return {
    ok: checks.every((check) => check.level !== "required" || check.ok),
    checks
  };
}

export function renderDoctorReport(report) {
  const lines = ["# Bose-AI Doctor", ""];

  for (const check of report.checks) {
    const marker = check.ok ? "OK" : check.level === "required" ? "FAIL" : "WARN";
    lines.push(`${marker} ${check.label}`);
    lines.push(`  ${check.message}`);
    if (check.fix) {
      lines.push(`  Fix: ${check.fix}`);
    }
  }

  lines.push("");
  lines.push(report.ok ? "Required checks passed." : "Required checks failed.");
  return `${lines.join("\n")}\n`;
}

async function commandCheck(command, cwd, level) {
  const executable = process.env[command.env] || command.name;
  const exists = command.name === "node" ? true : commandExists(executable);

  if (!exists) {
    return {
      ok: false,
      level,
      label: command.label,
      message: `${executable} was not found. ${command.reason}`,
      fix: installHint(command.name)
    };
  }

  const version = await readCommandVersion(executable, cwd);
  const versionText = version ? `Found ${version}.` : `Found ${executable}.`;
  const major = command.name === "node" ? Number.parseInt(process.versions.node.split(".")[0], 10) : null;

  if (command.minimumMajor && major < command.minimumMajor) {
    return {
      ok: false,
      level,
      label: command.label,
      message: `${versionText} Bose-AI requires ${command.label} ${command.minimumMajor}+.`,
      fix: `Install ${command.label} ${command.minimumMajor} or newer.`
    };
  }

  return {
    ok: true,
    level,
    label: command.label,
    message: `${versionText} ${command.reason}`
  };
}

function envCheck(env) {
  const configured = Boolean(process.env[env.name]);
  return {
    ok: configured,
    level: "optional",
    label: env.label,
    message: configured ? `${env.name} is set. ${env.reason}` : `${env.name} is not set. ${env.reason}`,
    fix: configured ? null : `Set ${env.name} in your shell or .env loader.`
  };
}

async function gitRemoteCheck(cwd) {
  try {
    const result = await runCommand("git", ["remote", "-v"], { cwd, timeoutMs: 10_000 });
    const remotes = result.stdout.trim();
    return {
      ok: Boolean(remotes),
      level: "optional",
      label: "Git remote",
      message: remotes ? `Configured:\n  ${remotes.replaceAll("\n", "\n  ")}` : "No git remote is configured yet.",
      fix: remotes ? null : "Run `git remote add origin https://github.com/nocturnaljojo/Bose-AI.git`."
    };
  } catch {
    return {
      ok: false,
      level: "optional",
      label: "Git remote",
      message: "Could not inspect git remotes.",
      fix: "Run `git remote -v` from the repo root."
    };
  }
}

async function readCommandVersion(command, cwd) {
  if (command === "node") {
    return process.version;
  }

  try {
    const result = await runCommand(command, ["--version"], { cwd, timeoutMs: 10_000 });
    return firstLine(result.stdout || result.stderr);
  } catch {
    return null;
  }
}

function firstLine(text) {
  return text.trim().split(/\r?\n/)[0] || null;
}

function installHint(name) {
  const hints = {
    node: "Install Node.js 20+.",
    npm: "Install Node.js, which includes npm.",
    git: "Install Git and make sure it is on PATH.",
    codex: "Install and authenticate the Codex CLI.",
    gemini: "Install Gemini CLI or set BOSE_GEMINI_BIN.",
    claude: "Install Claude Code if you want Claude Code terminal workflows.",
    npx: "Install Node.js/npm.",
    eas: "Install EAS CLI when you are ready for Expo builds."
  };
  return hints[name] || null;
}
