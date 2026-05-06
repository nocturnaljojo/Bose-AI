import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const IGNORED_DIRS = new Set([
  ".git",
  ".bose",
  ".next",
  ".expo",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".vercel"
]);

const TEXT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".toml",
  ".env",
  ".prisma",
  ".sql"
]);

export async function scanRepo(root) {
  const absoluteRoot = path.resolve(root);
  const files = await walk(absoluteRoot, absoluteRoot);
  const packageJson = await readJsonIfExists(path.join(absoluteRoot, "package.json"));
  const textSamples = await readSmallTextFiles(absoluteRoot, files);

  return {
    root: absoluteRoot,
    files,
    packageJson,
    textSamples
  };
}

async function walk(root, current) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example" && entry.name !== ".claude") {
      if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;
    }

    const absolute = path.join(current, entry.name);
    const relative = path.relative(root, absolute).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      files.push(...await walk(root, absolute));
    } else {
      files.push(relative);
    }
  }

  return files.sort();
}

async function readJsonIfExists(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function readSmallTextFiles(root, files) {
  const samples = {};
  const candidates = files.filter((file) => {
    const extension = path.extname(file);
    return TEXT_EXTENSIONS.has(extension) && !file.includes("package-lock.json");
  });

  for (const file of candidates.slice(0, 120)) {
    const absolute = path.join(root, file);
    try {
      const info = await stat(absolute);
      if (info.size > 80_000) continue;
      samples[file] = await readFile(absolute, "utf8");
    } catch {
      // Best-effort scan only.
    }
  }

  return samples;
}
