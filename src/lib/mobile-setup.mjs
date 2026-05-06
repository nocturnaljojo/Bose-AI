import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { commandExists } from "./process.mjs";

const VALID_TEMPLATES = ["default", "tabs", "blank", "navigation"];
const MIN_NODE_MAJOR = 20;

export function buildSetupPlan(options = {}) {
  const cwd = options.cwd || process.cwd();
  const name = (options.name || "mobile").trim();
  const requestedDir = options.dir || "apps/mobile";
  const template = options.template || "default";
  const force = Boolean(options.force);

  const absoluteDir = path.resolve(cwd, requestedDir);
  const dirState = describeDirState(absoluteDir);
  const node = describeNode();
  const npx = { ok: commandExists("npx") };

  const blockers = [];
  if (!node.ok) {
    blockers.push(`Node ${MIN_NODE_MAJOR}+ required (found ${node.version || "unknown"}).`);
  }
  if (!npx.ok) {
    blockers.push("npx was not found on PATH. Install Node.js with npm/npx, then retry.");
  }
  if (!VALID_TEMPLATES.includes(template)) {
    blockers.push(`Unknown template "${template}". Choose one of: ${VALID_TEMPLATES.join(", ")}.`);
  }
  if (dirState.kind === "nonempty" && !force) {
    blockers.push(
      `Target directory is not empty: ${requestedDir}. Pass --force to scaffold here anyway, or pick a different --dir.`
    );
  }

  const commandArgs = ["create-expo-app@latest", requestedDir, "--template", template];
  const command = `npx ${commandArgs.join(" ")}`;

  return {
    generatedAt: new Date().toISOString(),
    cwd,
    name,
    requestedDir,
    absoluteDir,
    template,
    force,
    prereqs: { node, npx, dirState },
    command,
    commandArgs,
    blockers,
    nextSteps: defaultNextSteps(requestedDir)
  };
}

export function renderPreflight(plan) {
  const lines = [];
  lines.push(`Bose mobile init preflight`);
  lines.push("");
  lines.push(`  Name      : ${plan.name}`);
  lines.push(`  Directory : ${plan.requestedDir}  (${plan.absoluteDir})`);
  lines.push(`  Template  : ${plan.template}`);
  lines.push(`  Force     : ${plan.force ? "yes" : "no"}`);
  lines.push("");
  lines.push("Prerequisites:");
  lines.push(`  - Node ${MIN_NODE_MAJOR}+      : ${plan.prereqs.node.ok ? "ok" : "missing"} (${plan.prereqs.node.version || "unknown"})`);
  lines.push(`  - npx on PATH    : ${plan.prereqs.npx.ok ? "ok" : "missing"}`);
  lines.push(`  - Target state   : ${plan.prereqs.dirState.kind}`);
  lines.push("");
  lines.push("Command:");
  lines.push(`  ${plan.command}`);
  lines.push("");
  if (plan.blockers.length > 0) {
    lines.push("Blockers:");
    for (const blocker of plan.blockers) {
      lines.push(`  - ${blocker}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

export function renderSetupNotes(plan) {
  const blockerSection = plan.blockers.length > 0
    ? `\n## Blockers\n\n${plan.blockers.map((blocker) => `- ${blocker}`).join("\n")}\n`
    : "";

  return `# Bose Mobile Setup

Generated: ${plan.generatedAt}
Target directory: ${plan.requestedDir}
Template: ${plan.template}
${blockerSection}
## Scaffolding command

Run from the repo root:

\`\`\`
${plan.command}
\`\`\`

If you launched \`bose mobile init --run\`, this command was already executed.

## Next steps

${plan.nextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## Useful Bose commands

- \`bose mobile context\` — capture the web/backend signals to reuse in the new app.
- \`bose mobile audit --dir ${plan.requestedDir}\` — review the new Expo app against the mobile context.
- \`bose mobile plan\` — refresh the implementation plan after the app exists.
`;
}

function describeNode() {
  const version = process.versions?.node || "";
  const major = Number.parseInt(version.split(".")[0] || "0", 10);
  return {
    version,
    major,
    ok: Number.isFinite(major) && major >= MIN_NODE_MAJOR
  };
}

function describeDirState(absoluteDir) {
  if (!existsSync(absoluteDir)) {
    return { kind: "absent" };
  }
  const stats = statSync(absoluteDir);
  if (!stats.isDirectory()) {
    return { kind: "file" };
  }
  const entries = readdirSync(absoluteDir);
  return { kind: entries.length === 0 ? "empty" : "nonempty", entries: entries.length };
}

function defaultNextSteps(targetDir) {
  return [
    `Run \`bose mobile context\` from the repo root and skim \`.bose/mobile-context/CONTEXT_PACK.md\` so the new app reuses the web product's auth, API, and data signals.`,
    `Wire shared design tokens into ${targetDir}: copy \`.bose/mobile-context/DESIGN_TOKENS.json\` into a theme module (colors, typography, spacing) before any UI work.`,
    `Configure environment in ${targetDir}: create \`.env.local\` and use \`EXPO_PUBLIC_*\` variables for the API base URL; mirror staging/prod values used by the web app.`,
    `Reuse auth and API: import or copy the web app's auth provider and API client; do not invent a new backend unless the context pack says no backend exists.`,
    `Verify on device: \`cd ${targetDir} && npx expo start\` then open in Expo Go (simple apps) or build a development client (\`npx expo run:ios\` / \`npx expo run:android\`) for native modules.`
  ];
}
