import { spawn, spawnSync } from "node:child_process";

export function commandExists(command) {
  const checker = process.platform === "win32" ? "where.exe" : "command";
  const args = process.platform === "win32" ? [command] : ["-v", command];
  const result = spawnSync(checker, args, {
    shell: process.platform !== "win32",
    stdio: "ignore"
  });
  return result.status === 0;
}

export function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...(options.env || {}) },
      shell: process.platform === "win32",
      stdio: options.inherit ? "inherit" : ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    if (!options.inherit) {
      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    const timeout = options.timeoutMs
      ? setTimeout(() => {
          child.kill("SIGTERM");
          reject(new Error(`Command timed out: ${command} ${args.join(" ")}`));
        }, options.timeoutMs)
      : null;

    child.on("error", (error) => {
      if (timeout) clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      if (timeout) clearTimeout(timeout);
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(stderr.trim() || `Command failed with exit code ${code}: ${command} ${args.join(" ")}`));
      }
    });
  });
}
