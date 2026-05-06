#!/usr/bin/env node
import { runCli } from "../src/cli.mjs";

runCli(process.argv).catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
