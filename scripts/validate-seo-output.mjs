#!/usr/bin/env node
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const OUT = resolve(ROOT, "out");
const PUBLIC = resolve(ROOT, "public");
const snapshot = JSON.parse(await readFile(resolve(ROOT, "data/generated/public-model-data.json"), "utf8"));
const routeMap = JSON.parse(await readFile(resolve(ROOT, "data/generated/model-route-map.json"), "utf8"));
const errors = [];
const pathFor = (route) => resolve(OUT, route.replace(/^\//, ""), "index.html");
async function html(route) { try { return await readFile(pathFor(route), "utf8"); } catch { errors.push(`Missing generated route: ${route}`); return ""; } }
function assert(condition, message) { if (!condition) errors.push(message); }
function pageChecks(source, route) {
  assert(/<title>[^<]+<\/title>/.test(source), `${route} lacks title`);
  assert(/<meta name="description" content="[^"]+"/.test(source), `${route} lacks meta description`);
  const canonical = source.match(/<link rel="canonical" href="([^"]+)"/); assert(Boolean(canonical), `${route} lacks canonical`); if (canonical) { assert(canonical[1].startsWith("https://llm7.io/"), `${route} canonical is not absolute LLM7 URL`); assert(canonical[1].endsWith("/"), `${route} canonical lacks trailing slash`); canonicals.push(canonical[1]); }
  assert(/<h1\b[^>]*>[\s\S]*?<\/h1>/.test(source), `${route} lacks H1`); assert(/aria-label="Breadcrumb"/.test(source), `${route} lacks breadcrumbs`);
  assert(!/Loading\.\.\.|loading placeholder/i.test(source), `${route} has search-critical loading placeholder`);
  assert(!/owned_by|provider_name|provider_slug|supplier|upstream deployment|route name/i.test(source), `${route} exposes provider-related text`);
  assert(!/\/ping|payAsYouGoModels|payAsYouGoModels\.json/.test(source), `${route} depends on forbidden legacy model source`);
  for (const script of source.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) { try { JSON.parse(script[1]); } catch { errors.push(`${route} has invalid JSON-LD`); } }
}
const canonicals = [];
const models = snapshot.models.map((entry) => entry.model);
const activeBySlug = new Map(models.filter((model) => model.status === "active").map((model) => [model.slug, model]));
const catalogue = await html("/models/"); pageChecks(catalogue, "/models/");
for (const model of models) { const route = `/models/${model.slug}/`; const source = await html(route); pageChecks(source, route); assert(source.includes(model.model_id), `${route} lacks exact model ID`); assert(source.includes("Current LLM7 pricing"), `${route} lacks current pricing`); }
const comparisons = Object.entries(routeMap.pairs);
const uniquePairs = new Set();
for (const [key, pair] of comparisons) {
  assert(pair.leftSlug !== pair.rightSlug, `${key} is a self-comparison`); const left = activeBySlug.get(pair.leftSlug); const right = activeBySlug.get(pair.rightSlug); assert(Boolean(left && right), `${key} contains retired or missing model`); assert(left?.model_type === right?.model_type, `${key} is cross-type`); assert(!uniquePairs.has(`${pair.rightSlug}--vs--${pair.leftSlug}`), `${key} has a reverse duplicate`); uniquePairs.add(key);
  const route = `/compare/${key}/`; const source = await html(route); pageChecks(source, route); if (left && right) assert(source.includes(left.model_id) && source.includes(right.model_id), `${route} lacks both model IDs`);
}
const expectedCount = (["chat", "image", "video"]).reduce((sum, type) => { const n = models.filter((model) => model.status === "active" && model.model_type === type).length; return sum + n * (n - 1) / 2; }, 0);
assert(comparisons.length === expectedCount, `Generated pair count ${comparisons.length} does not equal ${expectedCount}`);
assert(new Set(canonicals).size === canonicals.length, "Duplicate canonical URLs found");
const index = await readFile(resolve(PUBLIC, "sitemap.xml"), "utf8");
const children = [...index.matchAll(/<loc>https:\/\/llm7\.io\/([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapUrls = new Set();
for (const child of children) { const xml = await readFile(resolve(PUBLIC, child), "utf8"); const urls = [...xml.matchAll(/<loc>(https:\/\/llm7\.io\/[^<]+)<\/loc>/g)].map((match) => match[1]); assert(urls.length <= 45_000, `${child} exceeds 45,000 URLs`); urls.forEach((url) => sitemapUrls.add(url)); }
for (const model of models) assert(sitemapUrls.has(`https://llm7.io/models/${model.slug}/`), `Model route missing from sitemap: ${model.slug}`);
for (const [key] of comparisons) assert(sitemapUrls.has(`https://llm7.io/compare/${key}/`), `Comparison route missing from sitemap: ${key}`);
for (const url of sitemapUrls) { const file = pathFor(new URL(url).pathname); try { await stat(file); } catch { errors.push(`Sitemap URL has no generated file: ${url}`); } }
if (errors.length) { console.error(`SEO validation failed (${errors.length} errors):\n${errors.map((error) => `- ${error}`).join("\n")}`); process.exitCode = 1; } else console.log(`SEO validation passed for ${models.length} model pages and ${comparisons.length} comparison pages.`);
