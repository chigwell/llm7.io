#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import React from "react";
import { ImageResponse } from "@vercel/og";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const SNAPSHOT = resolve(ROOT, "data/generated/public-model-data.json");
const PUBLIC = resolve(ROOT, "public");
const SITE = "https://llm7.io";
const LIMIT = 45_000;

const xml = (value) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[character]);
const iso = (value) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toISOString() : new Date().toISOString();
const latest = (...values) => new Date(Math.max(...values.filter(Boolean).map((value) => Date.parse(value)))).toISOString();
const modelPath = (slug) => `/models/${slug}/`;
const pairKey = (left, right) => `${left}--vs--${right}`;
const pairPath = (left, right) => `/compare/${pairKey(left, right)}/`;

function priceSummary(model) {
  const pricing = model.pricing;
  return pricing.mode === "token" ? `$${pricing.input} input · $${pricing.output} output / ${pricing.unit}` : `$${pricing.price} / ${pricing.unit}`;
}

function capabilities(model) {
  const facts = [];
  if (model.modalities.input.includes("image") || model.capabilities.vision) facts.push("Image input");
  if (model.tools_calling || model.capabilities.tools) facts.push("Tool calling");
  if (model.capabilities.image_generation) facts.push("Image generation");
  if (model.capabilities.video_generation) facts.push("Video generation");
  if (model.stream || model.capabilities.stream) facts.push("Streaming");
  return facts.slice(0, 2).join(" · ") || "Published API capabilities";
}

async function ogImage(title, eyebrow, price, fact, filename) {
  const element = React.createElement("div", { style: { height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "68px", color: "#f8fafc", backgroundColor: "#0f172a", backgroundImage: "linear-gradient(135deg,#0f172a,#312e81)" } },
    React.createElement("div", { style: { display: "flex", fontSize: 32, fontWeight: 700, color: "#c4b5fd" } }, "LLM7 API"),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } },
      React.createElement("div", { style: { display: "flex", fontSize: 28, color: "#a5b4fc", textTransform: "uppercase" } }, eyebrow),
      React.createElement("div", { style: { display: "flex", fontSize: title.length > 32 ? 54 : 68, fontWeight: 700, lineHeight: 1.08 } }, title),
      React.createElement("div", { style: { display: "flex", fontSize: 28, color: "#ddd6fe" } }, price),
      React.createElement("div", { style: { display: "flex", fontSize: 23, color: "#cbd5e1" } }, fact),
    ),
    React.createElement("div", { style: { display: "flex", fontSize: 22, color: "#94a3b8" } }, "Pricing and latest aggregated LLM7 statistics"),
  );
  const response = new ImageResponse(element, { width: 1200, height: 630 });
  await writeFile(filename, Buffer.from(await response.arrayBuffer()));
}

function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ path, lastmod }) => `  <url><loc>${xml(`${SITE}${path}`)}</loc><lastmod>${iso(lastmod)}</lastmod></url>`).join("\n")}\n</urlset>\n`;
}

function sitemapIndex(paths) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <sitemap><loc>${SITE}/${path}</loc></sitemap>`).join("\n")}\n</sitemapindex>\n`;
}

async function main() {
  const snapshot = JSON.parse(await readFile(SNAPSHOT, "utf8"));
  const models = snapshot.models.map((entry) => entry.model).sort((a, b) => a.slug.localeCompare(b.slug));
  const active = models.filter((model) => model.status === "active");
  const bySlug = new Map(models.map((model) => [model.slug, model]));
  const pairs = [];
  for (const type of ["chat", "image", "video"]) {
    const group = active.filter((model) => model.model_type === type).sort((a, b) => a.slug.localeCompare(b.slug));
    for (let left = 0; left < group.length; left += 1) for (let right = left + 1; right < group.length; right += 1) pairs.push({ leftSlug: group[left].slug, rightSlug: group[right].slug });
  }
  await mkdir(resolve(PUBLIC, "generated/og/models"), { recursive: true });
  await Promise.all(models.map((model) => ogImage(model.display_name, `${model.model_type} model`, priceSummary(model), capabilities(model), resolve(PUBLIC, `generated/og/models/${model.slug}.png`))));
  await ogImage("Model comparison", "LLM7 API", "Current pricing and latest statistics", "Compare models of the same published type", resolve(PUBLIC, "generated/og/model-comparison.png"));

  const modelUrls = models.map((model) => ({ path: modelPath(model.slug), lastmod: latest(model.updated_at, model.latest_metrics_bucket, snapshot.metadata.latest_metrics_bucket) }));
  const comparisonUrls = pairs.map(({ leftSlug, rightSlug }) => {
    const left = bySlug.get(leftSlug); const right = bySlug.get(rightSlug);
    return { path: pairPath(leftSlug, rightSlug), lastmod: latest(left.updated_at, left.latest_metrics_bucket, right.updated_at, right.latest_metrics_bucket, snapshot.metadata.latest_metrics_bucket) };
  });
  const staticUrls = [{ path: "/", lastmod: snapshot.metadata.generated_at }, { path: "/models/", lastmod: snapshot.metadata.catalog_updated_at }, { path: "/compare/", lastmod: snapshot.metadata.catalog_updated_at }, { path: "/showcase/", lastmod: snapshot.metadata.generated_at }, { path: "/Themes/", lastmod: snapshot.metadata.generated_at }];
  await writeFile(resolve(PUBLIC, "sitemap-static.xml"), sitemap(staticUrls));
  await writeFile(resolve(PUBLIC, "sitemap-models.xml"), sitemap(modelUrls));
  const names = ["sitemap-static.xml", "sitemap-models.xml"];
  for (let index = 0; index < comparisonUrls.length; index += LIMIT) {
    const name = `sitemap-comparisons-${String(index / LIMIT + 1).padStart(4, "0")}.xml`;
    await writeFile(resolve(PUBLIC, name), sitemap(comparisonUrls.slice(index, index + LIMIT)));
    names.push(name);
  }
  await writeFile(resolve(PUBLIC, "sitemap.xml"), sitemapIndex(names));
  await writeFile(resolve(PUBLIC, "robots.txt"), "User-agent: *\nAllow: /\n\nSitemap: https://llm7.io/sitemap.xml\n");
  await mkdir(resolve(ROOT, "data/generated"), { recursive: true });
  await writeFile(resolve(ROOT, "data/generated/model-route-map.json"), `${JSON.stringify({ pairs: Object.fromEntries(pairs.map((pair) => [pairKey(pair.leftSlug, pair.rightSlug), pair])) }, null, 2)}\n`);
  console.log(`Generated ${models.length} model OG images, ${pairs.length} comparison routes, and ${names.length} sitemap files.`);
}

main().catch((error) => { console.error(`SEO asset generation failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}`); process.exitCode = 1; });
