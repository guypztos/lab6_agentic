// Makes sure Remotion's Chrome Headless Shell exists at a path without spaces.
// See remotion.config.ts for why. Delete ~/.cache/remotion-chrome after upgrading
// Remotion so the matching Chrome version gets fetched again.
import os from "node:os";
import path from "node:path";
import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { ensureBrowser } from "@remotion/renderer";

const DEST = path.join(os.homedir(), ".cache", "remotion-chrome");
if (existsSync(path.join(DEST, "chrome-headless-shell"))) process.exit(0);

console.log("Fetching Chrome Headless Shell for Remotion...");
await ensureBrowser(); // downloads into node_modules/.remotion/chrome-headless-shell/<platform>/
const root = "node_modules/.remotion/chrome-headless-shell";
const platform = readdirSync(root).find((d) => !d.startsWith(".") && d !== "VERSION");
const src = path.join(root, platform, `chrome-headless-shell-${platform}`);

mkdirSync(path.dirname(DEST), { recursive: true });
try {
  renameSync(src, DEST);
} catch {
  cpSync(src, DEST, { recursive: true });
  rmSync(src, { recursive: true, force: true });
}
console.log(`Chrome Headless Shell -> ${DEST}`);
