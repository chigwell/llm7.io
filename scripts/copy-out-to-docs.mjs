import { replaceDirectory } from "./static-files.mjs";
import { existsSync } from "fs";
import { resolve } from "path";

const out = resolve(process.cwd(), "out");
const docs = resolve(process.cwd(), "docs");

if (!existsSync(out)) {
  console.error("❌ No out/ folder found — run next export first.");
  process.exit(1);
}

replaceDirectory(out, docs);
console.log("✅ Copied out/ → docs/");
