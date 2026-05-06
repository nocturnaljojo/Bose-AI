import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildMobileContextPack, defaultOutDir, renderContextPack } from "./lib/context-pack.mjs";
import { buildDoctorReport, renderDoctorReport } from "./lib/doctor.mjs";
import { callProvider, listProviders } from "./providers/index.mjs";
import { startMcpServer } from "./mcp/server.mjs";

const VERSION = "0.1.0";

export async function runCli(argv = process.argv, io = process) {
  const args = argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    io.stdout.write(helpText());
    return;
  }

  if (command === "--version" || command === "-v") {
    io.stdout.write(`bose ${VERSION}\n`);
    return;
  }

  if (command === "providers") {
    io.stdout.write(renderProviders());
    return;
  }

  if (command === "doctor") {
    const report = await buildDoctorReport(process.cwd());
    io.stdout.write(renderDoctorReport(report));
    if (!report.ok) {
      process.exitCode = 1;
    }
    return;
  }

  if (command === "ask") {
    await askCommand(args.slice(1), io);
    return;
  }

  if (command === "council") {
    await councilCommand(args.slice(1), io);
    return;
  }

  if (command === "mobile") {
    await mobileCommand(args.slice(1), io);
    return;
  }

  if (command === "rork") {
    await rorkCommand(args.slice(1), io);
    return;
  }

  if (command === "mcp") {
    await startMcpServer();
    return;
  }

  throw new Error(`Unknown command: ${command}\n\n${helpText()}`);
}

function helpText() {
  return `Bose-AI: a council of AI models, convened in your terminal.

Usage:
  bose providers
  bose doctor
  bose ask <provider> <prompt>
  bose council <question>
  bose mobile context [--out <dir>] [--dry-run]
  bose mobile plan [--out <dir>]
  bose mobile init [--name <name>] [--dir <path>] [--run]
  bose mobile audit [--dir <path>] [--out <dir>]
  bose rork context [--out <dir>]
  bose rork prompt [--out <dir>]
  bose rork import <github-url> [--dir <path>] [--run]
  bose rork audit [--dir <path>] [--out <dir>]
  bose mcp

Providers:
  gemini    Uses Gemini CLI via BOSE_GEMINI_BIN or gemini
  codex     Uses Codex CLI via BOSE_CODEX_BIN or codex
  openai    Uses OPENAI_API_KEY and BOSE_OPENAI_MODEL
  grok      Uses XAI_API_KEY and BOSE_GROK_MODEL
  deepseek  Uses DEEPSEEK_API_KEY and BOSE_DEEPSEEK_MODEL

Examples:
  bose doctor
  bose ask gemini "Map this repo's auth flow."
  bose council "Should this mobile app use Expo Router or React Navigation?"
  bose mobile context
  bose mobile audit --dir apps/mobile
  bose rork prompt
`;
}

function renderProviders() {
  const rows = listProviders().map((provider) => {
    const status = provider.available() ? "configured" : "needs setup";
    return `- ${provider.name}: ${status} - ${provider.description}`;
  });
  return `${rows.join("\n")}\n`;
}

async function askCommand(args, io) {
  const provider = args[0];
  const prompt = args.slice(1).join(" ").trim();

  if (!provider || !prompt) {
    throw new Error("Usage: bose ask <provider> <prompt>");
  }

  const result = await callProvider(provider, prompt, { cwd: process.cwd() });
  io.stdout.write(`# ${result.provider}\n\n${result.text.trim()}\n`);
}

async function councilCommand(args, io) {
  const prompt = args.join(" ").trim();
  if (!prompt) {
    throw new Error("Usage: bose council <question>");
  }

  const providers = listProviders().filter((provider) => provider.available());
  if (providers.length === 0) {
    throw new Error("No providers are configured. Run `bose providers` and set the required keys or CLIs.");
  }

  const responses = await Promise.allSettled(
    providers.map((provider) => callProvider(provider.name, prompt, { cwd: process.cwd() }))
  );

  const lines = ["# Bose-AI Council", "", `Prompt: ${prompt}`, ""];
  responses.forEach((response, index) => {
    const provider = providers[index].name;
    lines.push(`## ${provider}`);
    if (response.status === "fulfilled") {
      lines.push(response.value.text.trim());
    } else {
      lines.push(`Error: ${response.reason?.message || String(response.reason)}`);
    }
    lines.push("");
  });

  lines.push("## Synthesis");
  lines.push("Use Claude Code to compare the responses above for consensus, disagreement, and the most defensible next action.");
  io.stdout.write(`${lines.join("\n")}\n`);
}

async function mobileCommand(args, io) {
  const subcommand = args[0];

  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    io.stdout.write(`Usage:
  bose mobile context [--out <dir>] [--dry-run]
  bose mobile plan [--out <dir>]
  bose mobile init [--name <name>] [--dir <path>] [--run]
  bose mobile audit [--dir <path>] [--out <dir>]
`);
    return;
  }

  if (subcommand === "context") {
    const options = parseOptions(args.slice(1));
    const root = path.resolve(process.cwd(), options.root || ".");
    const outDir = path.resolve(process.cwd(), options.out || defaultOutDir("mobile-context"));
    const pack = await buildMobileContextPack(root, { target: "expo" });
    const rendered = renderContextPack(pack);

    if (options["dry-run"]) {
      io.stdout.write(rendered);
      return;
    }

    await writeContextFiles(outDir, pack, rendered);
    io.stdout.write(`Wrote mobile context pack to ${outDir}\n`);
    return;
  }

  if (subcommand === "plan") {
    const options = parseOptions(args.slice(1));
    const root = path.resolve(process.cwd(), options.root || ".");
    const outDir = path.resolve(process.cwd(), options.out || defaultOutDir("mobile-plan"));
    const pack = await buildMobileContextPack(root, { target: "expo" });
    const plan = renderMobilePlan(pack);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "MOBILE_PLAN.md"), plan);
    io.stdout.write(`Wrote mobile plan to ${path.join(outDir, "MOBILE_PLAN.md")}\n`);
    return;
  }

  if (subcommand === "audit") {
    const options = parseOptions(args.slice(1));
    const root = path.resolve(process.cwd(), options.dir || "apps/mobile");
    const outDir = path.resolve(process.cwd(), options.out || defaultOutDir("mobile-audit"));
    const pack = await buildMobileContextPack(root, { target: "expo" });
    const audit = renderMobileAudit(pack, "direct Expo/mobile app");
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "MOBILE_AUDIT.md"), audit);
    io.stdout.write(`Wrote mobile audit to ${path.join(outDir, "MOBILE_AUDIT.md")}\n`);
    return;
  }

  if (subcommand === "init") {
    const options = parseOptions(args.slice(1));
    const name = options.name || "mobile";
    const dir = options.dir || "apps/mobile";
    const command = `npx create-expo-app@latest ${quoteShell(dir)} --template default`;

    io.stdout.write(`Expo mobile app target: ${name}\n`);
    io.stdout.write(`Recommended command:\n  ${command}\n`);
    io.stdout.write("After creation, run `bose mobile context` from the repo root and wire shared auth/API/design tokens before UI polish.\n");

    if (options.run) {
      const { runCommand } = await import("./lib/process.mjs");
      await runCommand("npx", ["create-expo-app@latest", dir, "--template", "default"], { cwd: process.cwd(), inherit: true });
    }
    return;
  }

  throw new Error(`Unknown mobile command: ${subcommand}`);
}

async function rorkCommand(args, io) {
  const subcommand = args[0];

  if (!subcommand || subcommand === "--help" || subcommand === "-h") {
    io.stdout.write(`Usage:
  bose rork context [--out <dir>]
  bose rork prompt [--out <dir>]
  bose rork import <github-url> [--dir <path>] [--run]
  bose rork audit [--dir <path>] [--out <dir>]
`);
    return;
  }

  if (subcommand === "context") {
    const options = parseOptions(args.slice(1));
    const root = path.resolve(process.cwd(), options.root || ".");
    const outDir = path.resolve(process.cwd(), options.out || defaultOutDir("rork-context"));
    const pack = await buildMobileContextPack(root, { target: "rork" });
    const rendered = renderContextPack(pack);
    await writeContextFiles(outDir, pack, rendered);
    io.stdout.write(`Wrote Rork context pack to ${outDir}\n`);
    return;
  }

  if (subcommand === "prompt") {
    const options = parseOptions(args.slice(1));
    const root = path.resolve(process.cwd(), options.root || ".");
    const outDir = path.resolve(process.cwd(), options.out || defaultOutDir("rork-context"));
    const pack = await buildMobileContextPack(root, { target: "rork" });
    const prompt = renderRorkPrompt(pack);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "RORK_PROMPT.md"), prompt);
    io.stdout.write(`Wrote Rork prompt to ${path.join(outDir, "RORK_PROMPT.md")}\n`);
    return;
  }

  if (subcommand === "import") {
    const url = args[1];
    if (!url) {
      throw new Error("Usage: bose rork import <github-url> [--dir <path>] [--run]");
    }

    const options = parseOptions(args.slice(2));
    const dir = options.dir || "rork-import";
    const command = `git clone ${quoteShell(url)} ${quoteShell(dir)}`;
    io.stdout.write(`Rork import command:\n  ${command}\n`);
    io.stdout.write("After import, run `bose rork audit --dir rork-import` to review the Expo app against your mobile context.\n");

    if (options.run) {
      const { runCommand } = await import("./lib/process.mjs");
      await runCommand("git", ["clone", url, dir], { cwd: process.cwd(), inherit: true });
    }
    return;
  }

  if (subcommand === "audit") {
    const options = parseOptions(args.slice(1));
    const root = path.resolve(process.cwd(), options.dir || "rork-import");
    const outDir = path.resolve(process.cwd(), options.out || defaultOutDir("rork-audit"));
    const pack = await buildMobileContextPack(root, { target: "rork" });
    const audit = renderMobileAudit(pack, "Rork-generated Expo app");
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "RORK_AUDIT.md"), audit);
    io.stdout.write(`Wrote Rork audit to ${path.join(outDir, "RORK_AUDIT.md")}\n`);
    return;
  }

  throw new Error(`Unknown rork command: ${subcommand}`);
}

async function writeContextFiles(outDir, pack, rendered) {
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "CONTEXT_PACK.md"), rendered);
  await writeFile(path.join(outDir, "DATA_MODEL.md"), renderDataModel(pack));
  await writeFile(path.join(outDir, "API_CONTRACT.md"), renderApiContract(pack));
  await writeFile(path.join(outDir, "MOBILE_SCREENS.md"), renderMobileScreens(pack));
  await writeFile(path.join(outDir, "DESIGN_TOKENS.json"), `${JSON.stringify(pack.designTokens, null, 2)}\n`);
}

function renderMobilePlan(pack) {
  return `# Mobile Plan

## Target

Build a production Expo/React Native mobile app from this repo's existing product context.

## Current Repo Signals

- App type: ${pack.summary.appType}
- Frameworks: ${pack.summary.frameworks.join(", ") || "unknown"}
- Auth: ${pack.summary.auth.join(", ") || "not detected"}
- Backend/data: ${pack.summary.backend.join(", ") || "not detected"}

## Build Sequence

1. Confirm the mobile user journeys and data model before writing UI code.
2. Create or update \`apps/mobile\` with Expo Router.
3. Share types, API client, auth config, and design tokens from the web app where possible.
4. Implement core screens before visual polish.
5. Test in Expo Go for simple apps, or an Expo development build for native modules.
6. Run typecheck/lint and capture device verification notes.

## Files To Read First

${pack.importantFiles.map((file) => `- ${file}`).join("\n") || "- No files detected yet."}
`;
}

function renderMobileAudit(pack, sourceLabel) {
  const findings = [];

  if (!pack.dependencies.includes("expo")) {
    findings.push("Expo dependency was not detected. Confirm this is actually an Expo/React Native app.");
  }
  if (!pack.dependencies.includes("expo-router")) {
    findings.push("Expo Router was not detected. Decide whether to add it or keep the generated navigation pattern.");
  }
  if (pack.summary.backend.length === 0) {
    findings.push("No backend/data dependency was detected. Check whether the app invented local-only state.");
  }
  if (pack.summary.auth.length === 0) {
    findings.push("No auth provider was detected. Confirm whether this app needs auth before production work.");
  }

  return `# Mobile Audit

Source: ${sourceLabel}
Generated: ${pack.generatedAt}
Root: ${pack.root}

## Detected Stack

- App type: ${pack.summary.appType}
- Frameworks: ${pack.summary.frameworks.join(", ") || "unknown"}
- Auth: ${pack.summary.auth.join(", ") || "not detected"}
- Backend/data: ${pack.summary.backend.join(", ") || "not detected"}

## Findings

${findings.map((finding) => `- ${finding}`).join("\n") || "- No obvious structural issues detected by the static scan."}

## Files To Review

${pack.importantFiles.map((file) => `- ${file}`).join("\n") || "- No files detected."}

## Screen Files

${pack.screenFiles.map((file) => `- ${file}`).join("\n") || "- No screen files detected."}

## API/Data Files

${[...pack.apiFiles, ...pack.dataFiles].map((file) => `- ${file}`).join("\n") || "- No API or data files detected."}

## Next Review Questions

- Does this app preserve the source web app's auth and backend choices?
- Are data writes routed through the correct API/client?
- Are mobile routes native-feeling, or are they copied from web layouts?
- Does the app need Expo Go only, or a development build for native modules?
`;
}

function renderRorkPrompt(pack) {
  return `# Rork Handoff Prompt

Build a React Native/Expo mobile app from the project context below.

Rules:
- Use Expo and React Native.
- Preserve the existing product model, auth rules, API contracts, and design direction.
- Do not invent a new backend unless the context says no backend exists.
- Prefer a simple, production-shaped app over a decorative prototype.
- Create screens that match the workflows listed below.
- Keep generated code ready for GitHub export so Bose-AI/Claude Code can import, audit, and integrate it.

${renderContextPack(pack)}
`;
}

function renderDataModel(pack) {
  return `# Data Model

Detected schema and data-related files:

${pack.dataFiles.map((file) => `- ${file}`).join("\n") || "- None detected yet."}

Notes:
- Confirm entity names, required fields, optional fields, ownership, and sync behavior before mobile implementation.
- Keep database changes small and explicit.
`;
}

function renderApiContract(pack) {
  return `# API Contract

Detected API/backend files:

${pack.apiFiles.map((file) => `- ${file}`).join("\n") || "- None detected yet."}

Notes:
- Mobile should reuse existing API semantics rather than duplicating business logic.
- Document auth headers, environment variables, and error shapes before implementation.
`;
}

function renderMobileScreens(pack) {
  return `# Mobile Screens

Likely screen/component source files:

${pack.screenFiles.map((file) => `- ${file}`).join("\n") || "- None detected yet."}

Initial mobile screen plan:
- Home/dashboard
- Primary create/edit flow
- Detail view
- Settings/account
- Empty, loading, error, and offline states
`;
}

function parseOptions(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
    } else {
      options[key] = next;
      index += 1;
    }
  }
  return options;
}

function quoteShell(value) {
  return existsSync(value) || !/\s/.test(value) ? value : `"${value.replaceAll('"', '\\"')}"`;
}
