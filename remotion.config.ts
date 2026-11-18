import os from "node:os";
import path from "node:path";
import { Config } from "@remotion/cli/config";

// Chrome Headless Shell crashes on macOS when its path contains spaces, and this
// project lives under ".../Programming Exercises - HUJI/...". So the browser is kept
// in a space-free location (put there by scripts/ensure-browser.mjs).
Config.setBrowserExecutable(
  path.join(os.homedir(), ".cache", "remotion-chrome", "chrome-headless-shell"),
);
