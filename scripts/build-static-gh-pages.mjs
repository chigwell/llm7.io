// scripts/build-static-gh-pages.mjs
import { existsSync, rmSync, cpSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const project = process.cwd();
const apiOg = resolve(project, "app", "api", "og");
const staticDir = resolve(project, ".next/output/static");
const docsDir = resolve(project, "docs");

try {
  if (existsSync(apiOg)) {
    console.log("⚠️  /app/api/og exists and may break static export. Consider removing or stubbing it.");
  } else {
    console.log("ℹ️  /app/api/og does not exist — safe to export");
  }

  console.log("➡️  Running Next.js static build...");
  execSync("npx next build", { stdio: "inherit" });

  console.log("➡️  Copying .next/output/static → docs/ for GitHub Pages...");
  rmSync(docsDir, { recursive: true, force: true });
  cpSync(staticDir, docsDir, { recursive: true });

  console.log("✅ docs/ ready for GitHub Pages!");
} catch (err) {
  console.error("❌ Build/export failed:", err && err.message ? err.message : err);
  process.exitCode = 1;
}
