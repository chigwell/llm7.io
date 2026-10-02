#!/usr/bin/env node
// Temporarily replace generated inputs, run the real export, then restore all artifacts.
// Run while no development server or other build is writing these directories.
import { cp, mkdir, mkdtemp, rename, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
const root = fileURLToPath(new URL("..", import.meta.url));
const workspace = await mkdtemp(join(tmpdir(), "llm7-fixture-artifacts-"));
const lock = resolve(root, "node_modules/.cache/llm7-fixture-build.lock");
await mkdir(resolve(root, "node_modules/.cache"), { recursive: true });
await mkdir(lock); // Refuse concurrent fixture builds.
const fixed = [
  "data/generated",
  "public/generated",
  "public/robots.txt",
  "lib/componentSourceCode.ts",
  ".next",
  "out",
];
const sitemaps = (await readdir(resolve(root, "public")))
  .filter((name) => /^sitemap.*\.xml$/.test(name))
  .map((name) => `public/${name}`);
const originals = [...fixed, ...sitemaps];
const backups = [];
let prepared = false;
let activeChild;
let interrupted = false;
function interrupt(signal) {
  interrupted = true;
  activeChild?.kill(signal);
}
const onInterrupt = () => interrupt("SIGINT");
const onTerminate = () => interrupt("SIGTERM");
process.on("SIGINT", onInterrupt);
process.on("SIGTERM", onTerminate);
async function run(args) {
  if (interrupted) throw new Error("Fixture build interrupted");
  await new Promise((resolvePromise, reject) => {
    activeChild = spawn(process.execPath, args, {
      cwd: root,
      stdio: "inherit",
    });
    activeChild.once("error", reject);
    activeChild.once("exit", (code, signal) => {
      activeChild = undefined;
      if (code === 0) resolvePromise();
      else
        reject(
          new Error(
            `Fixture command failed (${signal ?? code}): ${args.join(" ")}`,
          ),
        );
    });
  });
}
try {
  for (const [index, path] of originals.entries()) {
    try {
      await rename(resolve(root, path), resolve(workspace, String(index)));
      backups.push({ path, index });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  prepared = true;
  await mkdir(resolve(root, "data/generated"), { recursive: true });
  await cp(
    resolve(root, "tests/fixtures/synchronized-snapshot.json"),
    resolve(root, "data/generated/public-model-data.json"),
  );
  for (const script of [
    "scripts/GenerateSourceMap.js",
    "scripts/generate-model-seo-assets.mjs",
    "scripts/validate-discovery-generation.mjs",
    "node_modules/next/dist/bin/next",
    "scripts/validate-seo-output.mjs",
  ]) {
    await run([script, ...(script.endsWith("/next") ? ["build"] : [])]);
  }
  await rename(resolve(root, "out"), resolve(workspace, "fixture-export"));
  console.log(`Verified fixture export: ${workspace}/fixture-export`);
} finally {
  if (prepared) {
    const generatedMaps = (await readdir(resolve(root, "public")))
      .filter((name) => /^sitemap.*\.xml$/.test(name))
      .map((name) => `public/${name}`);
    for (const path of new Set([...fixed, ...generatedMaps]))
      await rm(resolve(root, path), { recursive: true, force: true });
  }
  for (const { path, index } of backups)
    await rename(resolve(workspace, String(index)), resolve(root, path));
  await rm(lock, { recursive: true, force: true });
  process.removeListener("SIGINT", onInterrupt);
  process.removeListener("SIGTERM", onTerminate);
}
