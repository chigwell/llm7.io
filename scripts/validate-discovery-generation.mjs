// Run after generation. Re-running generation must preserve dates and prune stale maps.
import { readFile, writeFile, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const state = await readFile(
  "data/generated/discovery-page-state.json",
  "utf8",
);
await writeFile("public/sitemap-comparisons-9999.xml", "obsolete");
execFileSync(process.execPath, ["scripts/generate-model-seo-assets.mjs"], {
  stdio: "inherit",
});
assert.equal(
  await readFile("data/generated/discovery-page-state.json", "utf8"),
  state,
  "Unchanged generation moved lastmod dates",
);
await assert.rejects(access("public/sitemap-comparisons-9999.xml"));
console.log("Stable lastmod and obsolete sitemap cleanup passed.");
