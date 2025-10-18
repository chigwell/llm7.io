import { rmSync, cpSync, existsSync } from "fs";
import { resolve } from "path";

const out = resolve(process.cwd(), "out");
const docs = resolve(process.cwd(), "docs");

if (!existsSync(out)) {
  console.error("❌ No out/ folder found — run next export first.");
  process.exit(1);
}

rmSync(docs, { recursive: true, force: true });
cpSync(out, docs, { recursive: true });
console.log("✅ Copied out/ → docs/");
