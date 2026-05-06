import path from "node:path";
import { scanRepo } from "./repo-scan.mjs";

export function defaultOutDir(name) {
  return path.join(".bose", name);
}

export async function buildMobileContextPack(root, options = {}) {
  const repo = await scanRepo(root);
  const dependencies = {
    ...(repo.packageJson?.dependencies || {}),
    ...(repo.packageJson?.devDependencies || {})
  };
  const files = repo.files;

  const summary = {
    target: options.target || "expo",
    appType: detectAppType(files, dependencies),
    frameworks: detectFrameworks(files, dependencies),
    auth: detectAuth(files, dependencies),
    backend: detectBackend(files, dependencies)
  };

  const importantFiles = selectImportantFiles(files);
  const apiFiles = files.filter(isApiFile).slice(0, 60);
  const dataFiles = files.filter(isDataFile).slice(0, 60);
  const screenFiles = files.filter(isScreenFile).slice(0, 80);
  const designTokens = extractDesignTokens(repo.textSamples);

  return {
    generatedAt: new Date().toISOString(),
    root: repo.root,
    summary,
    importantFiles,
    apiFiles,
    dataFiles,
    screenFiles,
    designTokens,
    packageName: repo.packageJson?.name || null,
    scripts: repo.packageJson?.scripts || {},
    dependencies: Object.keys(dependencies).sort()
  };
}

export function renderContextPack(pack) {
  return `# Bose-AI Mobile Context Pack

Generated: ${pack.generatedAt}
Target: ${pack.summary.target}
Root: ${pack.root}

## Product/Repo Summary

- Package: ${pack.packageName || "unknown"}
- App type: ${pack.summary.appType}
- Frameworks: ${pack.summary.frameworks.join(", ") || "unknown"}
- Auth: ${pack.summary.auth.join(", ") || "not detected"}
- Backend/data: ${pack.summary.backend.join(", ") || "not detected"}

## Commands/Scripts

${Object.entries(pack.scripts).map(([name, command]) => `- ${name}: \`${command}\``).join("\n") || "- No package scripts detected."}

## Important Files

${pack.importantFiles.map((file) => `- ${file}`).join("\n") || "- No important files detected yet."}

## API Files

${pack.apiFiles.map((file) => `- ${file}`).join("\n") || "- No API files detected yet."}

## Data/Schema Files

${pack.dataFiles.map((file) => `- ${file}`).join("\n") || "- No data files detected yet."}

## Screen/Component Files

${pack.screenFiles.map((file) => `- ${file}`).join("\n") || "- No screen files detected yet."}

## Design Tokens

\`\`\`json
${JSON.stringify(pack.designTokens, null, 2)}
\`\`\`

## Mobile Build Instructions

- Use this context before generating mobile code.
- Preserve backend, auth, and API semantics from the web app.
- Define the data model and mobile user journeys before visual polish.
- Prefer Expo Router for default mobile app routing.
- Use Expo Go for simple apps and Expo development builds when native modules are required.
`;
}

function detectAppType(files, dependencies) {
  if (dependencies.expo || files.some((file) => file === "app.json" || file === "app.config.js")) return "expo/react-native";
  if (dependencies.next || files.some((file) => file === "next.config.js" || file === "next.config.mjs")) return "next/web";
  if (dependencies.vite || files.some((file) => file === "vite.config.ts" || file === "vite.config.js")) return "vite/web";
  if (dependencies.react) return "react";
  return "unknown";
}

function detectFrameworks(files, dependencies) {
  const frameworks = [];
  if (dependencies.next) frameworks.push("Next.js");
  if (dependencies.vite) frameworks.push("Vite");
  if (dependencies.react) frameworks.push("React");
  if (dependencies.expo) frameworks.push("Expo");
  if (dependencies["expo-router"]) frameworks.push("Expo Router");
  if (dependencies["@tanstack/react-query"]) frameworks.push("TanStack Query");
  if (dependencies.trpc || dependencies["@trpc/client"] || dependencies["@trpc/server"]) frameworks.push("tRPC");
  if (files.some((file) => file.includes("tailwind.config"))) frameworks.push("Tailwind CSS");
  return frameworks;
}

function detectAuth(files, dependencies) {
  const auth = [];
  const names = Object.keys(dependencies).join(" ");
  if (names.includes("clerk")) auth.push("Clerk");
  if (names.includes("next-auth") || names.includes("auth.js")) auth.push("Auth.js");
  if (names.includes("supabase")) auth.push("Supabase Auth");
  if (names.includes("firebase")) auth.push("Firebase Auth");
  if (files.some((file) => file.toLowerCase().includes("auth"))) auth.push("auth files present");
  return [...new Set(auth)];
}

function detectBackend(files, dependencies) {
  const backend = [];
  const names = Object.keys(dependencies).join(" ");
  if (names.includes("supabase")) backend.push("Supabase");
  if (names.includes("instantdb") || names.includes("@instantdb")) backend.push("InstantDB");
  if (names.includes("firebase")) backend.push("Firebase");
  if (names.includes("prisma")) backend.push("Prisma");
  if (names.includes("drizzle")) backend.push("Drizzle");
  if (files.some(isApiFile)) backend.push("API routes");
  return [...new Set(backend)];
}

function selectImportantFiles(files) {
  const importantNames = new Set([
    "package.json",
    "app.json",
    "app.config.js",
    "app.config.ts",
    "next.config.js",
    "next.config.mjs",
    "vite.config.ts",
    "vite.config.js",
    "tailwind.config.ts",
    "tailwind.config.js",
    "tsconfig.json",
    "README.md"
  ]);
  return files.filter((file) => importantNames.has(file) || isDataFile(file) || isApiFile(file)).slice(0, 80);
}

function isApiFile(file) {
  return /(^|\/)(api|routes|server|trpc)(\/|\.|$)/i.test(file)
    || /route\.(ts|tsx|js|jsx)$/i.test(file)
    || /controller|resolver|endpoint/i.test(file);
}

function isDataFile(file) {
  return /schema|model|migration|supabase|prisma|drizzle|db\.|database|instant/i.test(file)
    || file.endsWith(".sql")
    || file.endsWith(".prisma");
}

function isScreenFile(file) {
  return /(^|\/)(app|pages|screens|components|features)(\/|$)/i.test(file)
    && /\.(tsx|jsx|ts|js)$/.test(file);
}

function extractDesignTokens(samples) {
  const colors = new Set();
  const cssVariables = {};

  for (const [file, text] of Object.entries(samples)) {
    if (!/\.(css|scss|tsx|jsx|ts|js)$/.test(file)) continue;

    for (const match of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      colors.add(match[0]);
    }

    for (const match of text.matchAll(/--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g)) {
      cssVariables[`--${match[1]}`] = match[2].trim();
    }
  }

  return {
    colors: [...colors].slice(0, 40),
    cssVariables
  };
}
