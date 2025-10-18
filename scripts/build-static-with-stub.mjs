// scripts/build-static-with-stub.mjs
import { existsSync, renameSync, rmSync, cpSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const project = process.cwd();
const apiOg = resolve(project, "app", "api", "og");
const tmpApiBackup = resolve(project, ".tmp_api_backup", "og");
const tmpApiBackupDir = resolve(project, ".tmp_api_backup");
const out = resolve(project, "out");
const docs = resolve(project, "docs");

function safeRename(src, dst) {
  if (existsSync(src)) {
    // ensure parent exists for dst
    const parent = dst.replace(/\/[^/]+$/, "");
    try {
      mkdirSync(parent, { recursive: true });
    } catch {}
    renameSync(src, dst);
    return true;
  }
  return false;
}

function safeRestore(src, dst) {
  if (existsSync(src)) {
    // ensure parent exists for dst
    const parent = dst.replace(/\/[^/]+$/, "");
    try {
      mkdirSync(parent, { recursive: true });
    } catch {}
    renameSync(src, dst);
    return true;
  }
  return false;
}

try {
  console.log("➡️  Preparing static export: backing up app/api/og (if exists)");
  const moved = safeRename(apiOg, tmpApiBackup);

  // Ensure app/api/og directory exists and create a minimal stub route.js
  const apiOgDir = apiOg; // path to directory we want to create
  mkdirSync(apiOgDir, { recursive: true });

  const stubPath = resolve(apiOgDir, "route.js");
  const stubContent = `// Temporary stub for static export.
// This avoids runtime-only features (e.g. request.url) during typegen/build.
// Restored after the build.

export async function GET() {
  // Return an empty 204 so Next's typegen/build can see a valid export.
  return new Response(null, { status: 204 });
}

// Also export default to be safe for different handler styles
export default { GET };
`;
  writeFileSync(stubPath, stubContent, { encoding: "utf8" });
  console.log("🟢 Stub created at app/api/og/route.js");

  // Run build & export
  console.log("➡️  Running `npx next build`");
  execSync("npx next build", { stdio: "inherit" });

  console.log("➡️  Running `npx next export`");
  execSync("npx next export", { stdio: "inherit" });

  // Copy out/ -> docs/
  console.log("➡️  Copying out/ → docs/");
  rmSync(docs, { recursive: true, force: true });
  if (!existsSync(out)) {
    throw new Error("No out/ directory produced by next export");
  }
  cpSync(out, docs, { recursive: true });
  console.log("✅ Export complete. docs/ is ready for GitHub Pages.");
} catch (err) {
  console.error("❌ Build/export failed:", err && err.message ? err.message : err);
  process.exitCode = 1;
} finally {
  // Remove the stub and restore original folder if it existed
  try {
    const stubFile = resolve(apiOg, "route.js");
    if (existsSync(stubFile)) rmSync(stubFile);
    // remove directory if empty
    try {
      rmSync(apiOg, { recursive: true, force: true });
    } catch {}
  } catch {}

  if (existsSync(tmpApiBackup)) {
    console.log("➡️  Restoring original app/api/og from backup");
    safeRestore(tmpApiBackup, apiOg);
    // cleanup backup folder if empty
    try {
      rmSync(tmpApiBackupDir, { recursive: true, force: true });
    } catch {}
  } else if (!existsSync(apiOg)) {
    // no original to restore and we removed stub: safe state
    console.log("➡️  No original app/api/og to restore (wasn't present).");
  }
}
