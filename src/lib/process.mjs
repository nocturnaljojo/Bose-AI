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
    const useShell = process.platform === "win32";
    const spawnCommand = useShell ? buildWindowsCommandLine(command, args) : command;
    const spawnArgs = useShell ? [] : args;

    const child = spawn(spawnCommand, spawnArgs, {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...(options.env || {}) },
      shell: useShell,
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

function buildWindowsCommandLine(command, args) {
  return [command, ...args].map(quoteForCmd).join(" ");
}

function quoteForCmd(arg) {
  const value = String(arg);
  if (value.length > 0 && !/[ \t\r\n\v"]/.test(value)) {
    return value;
  }

  let result = "\"";
  let backslashes = 0;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (ch === "\\") {
      backslashes += 1;
      continue;
    }
    if (ch === "\"") {
      result += "\\".repeat(backslashes * 2 + 1);
      result += "\"";
      backslashes = 0;
      continue;
    }
    result += "\\".repeat(backslashes);
    backslashes = 0;
    result += ch;
  }
  result += "\\".repeat(backslashes * 2);
  result += "\"";
  return result;
}
