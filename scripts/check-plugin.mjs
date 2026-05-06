import { existsSync, readFileSync } from "node:fs";

const requiredPaths = [
  ".claude-plugin/plugin.json",
  "commands/doctor.md",
  "commands/mobile-context.md",
  "commands/mobile-plan.md",
  "commands/mobile-init.md",
  "commands/rork-prompt.md",
  "commands/council.md",
  "commands/orchestrate.md",
  "skills/bose-ai/SKILL.md",
  "bin/bose.mjs",
  "src/providers/deepseek.mjs"
];

for (const file of requiredPaths) {
  if (!existsSync(file)) {
    throw new Error(`Missing plugin file: ${file}`);
  }
}

const manifest = JSON.parse(readFileSync(".claude-plugin/plugin.json", "utf8"));

if (manifest.name !== "bose-ai") {
  throw new Error("Plugin manifest name must be bose-ai.");
}

if (!manifest.mcpServers?.["bose-ai"]) {
  throw new Error("Plugin manifest must define the bose-ai MCP server.");
}

if (!manifest.mcpServers["bose-ai"].args?.includes("mcp")) {
  throw new Error("Plugin MCP server must start Bose-AI in mcp mode.");
}

console.log("Plugin structure OK.");
