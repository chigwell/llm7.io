// scripts/build-static.mjs
import { existsSync, renameSync, rmSync, cpSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const project = process.cwd();
const apiPath = resolve(project, "app", "api");
const tmpApiPath = resolve(project, ".tmp_api_backup");
const out = resolve(project, "out");
const docs = resolve(project, "docs");

function safeRename(src, dst) {
  if (existsSync(src)) renameSync(src, dst);
}

function safeRestore(src, dst) {
  if (existsSync(src)) renameSync(src, dst);
}

try {
  // 1) Move app/api out of the way (if exists)
  console.log("➡️  Moving app/api → .tmp_api_backup (if present)");
  safeRename(apiPath, tmpApiPath);

  // 2) Build & export
  console.log("➡️  Running `next build && next export`");
  execSync("npx next build", { stdio: "inherit" });
  execSync("npx next export", { stdio: "inherit" });

  // 3) Copy out/ → docs/
  console.log("➡️  Copying out/ → docs/");
  rmSync(docs, { recursive: true, force: true });
  if (!existsSync(out)) {
    throw new Error("No out/ directory produced by next export");
  }
  cpSync(out, docs, { recursive: true });

  console.log("✅ Build + export complete. docs/ is ready for GitHub Pages.");
} catch (err) {
  console.error("❌ Build/export failed:", err.message || err);
  process.exitCode = 1;
} finally {
  // 4) Restore app/api
  console.log("➡️  Restoring app/api from .tmp_api_backup (if present)");
  safeRestore(tmpApiPath, apiPath);
}
