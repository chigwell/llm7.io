#!/usr/bin/env node
import { resolve } from "node:path";
import { syncPublicModelData } from "./models/synchronize.mjs";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
syncPublicModelData({ snapshotPath: resolve(ROOT, "data/generated/public-model-data.json") }).catch((error) => {
  console.error(`Public model synchronisation failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
