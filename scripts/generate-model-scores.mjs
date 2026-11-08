#!/usr/bin/env node
// Rates chat and image models on their SCORE_SETS criteria with pairwise TypeSafe Jev judgments.
// Every pair of same-type models is judged once in each order (A/B and B/A, to cancel position bias)
// and cached per type in data/model-pair-judgments*.json, so later builds only judge pairs that involve
// new models. A model's score on a criterion is its average win probability against every
// opponent, rescaled so the catalog leader shows 100. Results go to data/model-scores*.json.
// The build never fails on this step.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SCORE_SETS, meetsRequirement } from "../lib/models/score-criteria.js";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const SNAPSHOT = resolve(ROOT, "data/generated/public-model-data.json");
const HINTS = resolve(ROOT, "data/model-score-hints.json");
const ENDPOINT = "https://api.typesafe.pro/v1/systemone";
const CONCURRENCY = Number(process.env.SCORE_CONCURRENCY) || 8;
const ATTEMPTS = 4;
const SAVE_EVERY = 50;

function loadToken() {
  if (!process.env.TYPESAFEPRO_TOKEN && existsSync(resolve(ROOT, ".env"))) {
    try { process.loadEnvFile(resolve(ROOT, ".env")); } catch {}
  }
  return process.env.TYPESAFEPRO_TOKEN?.trim();
}

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, "utf8")); } catch { return fallback; }
}

const pairKey = (a, b) => `${a}||${b}`;
const yes = (value) => (value ? "yes" : "no");

// Hints fill gaps in Jev's knowledge of newer model families; matched by longest id prefix.
function hintFor(model, hints) {
  const id = model.model_id.toLowerCase().replace(/^[^/]+\//, "");
  const prefix = Object.keys(hints).filter((key) => id.startsWith(key.toLowerCase())).sort((a, b) => b.length - a.length)[0];
  return prefix ? hints[prefix] : null;
}

function chatFacts(label, model, hint) {
  return [
    `Model ${label}: "${model.model_id}"`,
    `  tier ${model.tier}; input ${model.modalities.input.join(", ")}; context window ${model.context_window?.tokens ?? "not published"} tokens`,
    `  tool calling ${yes(model.tools_calling)}; reasoning mode ${yes(model.reasoning)}; JSON mode ${yes(model.json_mode)}`,
    `  price per 1M tokens: input $${model.pricing?.input ?? "n/a"}, output $${model.pricing?.output ?? "n/a"}`,
    hint ? `  background: ${hint}` : null,
  ].filter(Boolean).join("\n");
}

function maxResolution(capabilities) {
  const sizes = (capabilities.supported_sizes ?? []).map((size) => size.split("x").map(Number)).filter(([w, h]) => w && h);
  if (sizes.length) return sizes.reduce((best, size) => (size[0] * size[1] > best[0] * best[1] ? size : best)).join("x");
  const dimensions = capabilities.sogni?.dimensions;
  if (dimensions) return `${dimensions.max_width}x${dimensions.max_height}`;
  return capabilities.image_resolution_tiers?.join("/") ?? "not published";
}

// Live traffic on LLM7 over the snapshot window. Not part of the cache key: it changes every build.
function usageFacts(points) {
  const sum = (field) => points.reduce((total, point) => total + (point[field] ?? 0), 0);
  const requests = sum("requests_total");
  if (!requests) return "  no recent traffic on LLM7";
  const observed = sum("latency_observations");
  const latency = observed ? points.reduce((total, point) => total + (point.latency_avg_ms ?? 0) * (point.latency_observations ?? 0), 0) / observed : null;
  return `  last 30 days on LLM7: ${requests} requests, ${Math.round((sum("successful_requests") / requests) * 100)}% succeeded${latency ? `, average ${(latency / 1000).toFixed(1)} s per image` : ""}`;
}

function imageFacts(label, model, hint, points) {
  const capabilities = model.capabilities ?? {};
  return [
    `Model ${label}: "${model.model_id}"`,
    `  tier ${model.tier}; price $${model.pricing?.price ?? "n/a"} per image; max output ${maxResolution(capabilities)}`,
    `  image editing ${yes(capabilities.image_edits)}; reference images up to ${capabilities.max_reference_images ?? 0}`,
    usageFacts(points),
    hint ? `  background: ${hint}` : null,
  ].filter(Boolean).join("\n");
}

const TYPES = {
  chat: {
    judgments: resolve(ROOT, "data/model-pair-judgments.json"),
    scores: resolve(ROOT, "data/model-scores.json"),
    state: (first, second, hints) => [
      "You are comparing two large language models available through the same API.",
      chatFacts("A", first, hintFor(first, hints)),
      chatFacts("B", second, hintFor(second, hints)),
      "Judge from what is publicly known about each model family, its release generation, size and published benchmarks, together with the facts above. Newer generations from the same vendor are usually stronger.",
    ].join("\n"),
  },
  image: {
    judgments: resolve(ROOT, "data/model-pair-judgments-image.json"),
    scores: resolve(ROOT, "data/model-scores-image.json"),
    state: (first, second, hints, usage) => [
      "You are comparing two AI image generation models available through the same API.",
      imageFacts("A", first, hintFor(first, hints), usage.get(first.model_id) ?? []),
      imageFacts("B", second, hintFor(second, hints), usage.get(second.model_id) ?? []),
      "Judge from what is publicly known about each model family, its release generation, architecture and published image arena results, together with the facts above. Newer generations from the same vendor are usually stronger. Use the LLM7 traffic numbers only for speed and reliability.",
    ].join("\n"),
  },
};

const pairCriteria = (set, left, right) => set.criteria.filter((criterion) => meetsRequirement(criterion, left) && meetsRequirement(criterion, right));

// Returns P(first wins) per criterion, ties counted as half a win.
async function judgeOnce(type, first, second, context) {
  const criteria = pairCriteria(SCORE_SETS[type], first, second);
  const questions = Object.fromEntries(criteria.map(({ key, label, description }) => [key, {
    type: "choice",
    instructions: `Which model is better at ${label.toLowerCase()}? ${description}`,
    criteria: { a: `Model A (${first.model_id}) is better`, tie: "They are about equal", b: `Model B (${second.model_id}) is better` },
  }]));
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${context.token}` },
    body: JSON.stringify({ state: TYPES[type].state(first, second, context.hints, context.usage), model: "jev-latest", questions }),
    signal: AbortSignal.timeout(60_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`HTTP ${response.status} ${JSON.stringify(body).slice(0, 200)}`);
  return {
    engine: body.model ?? null,
    wins: Object.fromEntries(criteria.map(({ key }) => {
      const probabilities = body.answers?.[key]?.probabilities;
      if (!probabilities) throw new Error(`missing answer for ${key}`);
      return [key, (probabilities.a ?? 0) + (probabilities.tie ?? 0) / 2];
    })),
  };
}

async function judgePair(type, left, right, context) {
  const [forward, backward] = await Promise.all([judgeOnce(type, left, right, context), judgeOnce(type, right, left, context)]);
  const wins = Object.fromEntries(Object.keys(forward.wins).map((key) => [key, Math.round(((forward.wins[key] + 1 - backward.wins[key]) / 2) * 1000) / 1000]));
  return { engine: forward.engine, judged_at: new Date().toISOString(), wins };
}

async function withRetries(task) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= ATTEMPTS) throw error;
      await new Promise((done) => setTimeout(done, 2000 * attempt));
    }
  }
}

// One pair per line keeps the cache diff-friendly.
async function saveJudgments(path, store) {
  const keys = Object.keys(store.pairs).sort();
  const lines = keys.map((key) => `    ${JSON.stringify(key)}: ${JSON.stringify(store.pairs[key])}`);
  await writeFile(path, `{\n  "criteria_version": ${store.criteria_version},\n  "pairs": {\n${lines.join(",\n")}\n  }\n}\n`);
}

function computeScores(criteria, models, store) {
  const totals = new Map(models.map((model) => [model.model_id, Object.fromEntries(criteria.map(({ key }) => [key, { sum: 0, count: 0 }]))]));
  for (let i = 0; i < models.length; i += 1) {
    for (let j = i + 1; j < models.length; j += 1) {
      const pair = store.pairs[pairKey(models[i].model_id, models[j].model_id)];
      if (!pair) continue;
      for (const [key, win] of Object.entries(pair.wins)) {
        totals.get(models[i].model_id)[key].sum += win; totals.get(models[i].model_id)[key].count += 1;
        totals.get(models[j].model_id)[key].sum += 1 - win; totals.get(models[j].model_id)[key].count += 1;
      }
    }
  }
  const rates = new Map([...totals].map(([id, byKey]) => [id, Object.fromEntries(Object.entries(byKey).map(([key, { sum, count }]) => [key, count ? sum / count : null]))]));
  const best = Object.fromEntries(criteria.map(({ key }) => [key, Math.max(0, ...[...rates.values()].map((rate) => rate[key] ?? 0))]));
  const result = {};
  for (const model of models) {
    const rate = rates.get(model.model_id);
    const scores = Object.fromEntries(criteria.map(({ key }) => [key, rate[key] === null || !best[key] ? null : Math.round((rate[key] / best[key]) * 100)]));
    const values = Object.values(scores).filter((value) => value !== null);
    const opponents = Math.max(...Object.values(totals.get(model.model_id)).map(({ count }) => count));
    if (values.length) result[model.model_id] = { overall: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length), opponents, scores };
  }
  return result;
}

async function scoreType(type, entries, context) {
  const set = SCORE_SETS[type];
  const { judgments, scores: scoresPath } = TYPES[type];
  const models = entries.map((entry) => entry.model).filter((model) => model.model_type === type).sort((a, b) => a.model_id.localeCompare(b.model_id));
  let store = await readJson(judgments, null);
  if (!store || store.criteria_version !== set.version) store = { criteria_version: set.version, pairs: {} };

  // A pair is re-judged when either model's background hint changes.
  const hintHash = (left, right) => createHash("sha1").update(`${hintFor(left, context.hints) ?? ""}|${hintFor(right, context.hints) ?? ""}`).digest("hex").slice(0, 10);
  const pending = [];
  for (let i = 0; i < models.length; i += 1) {
    for (let j = i + 1; j < models.length; j += 1) {
      const key = pairKey(models[i].model_id, models[j].model_id);
      if (store.pairs[key]?.hints !== hintHash(models[i], models[j])) pending.push([models[i], models[j]]);
    }
  }

  if (pending.length && !context.token) console.warn(`TYPESAFEPRO_TOKEN is not set; skipping ${pending.length} ${type} pairwise judgments.`);
  if (pending.length && context.token) {
    console.log(`Judging ${pending.length} ${type} model pairs (${pending.length * 2} requests)...`);
    let done = 0;
    const failed = [];
    let saving = Promise.resolve();
    const persist = () => (saving = saving.then(() => saveJudgments(judgments, store)));
    const queue = [...pending];
    await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
      for (let item = queue.shift(); item; item = queue.shift()) {
        const [left, right] = item;
        try {
          store.pairs[pairKey(left.model_id, right.model_id)] = { ...(await withRetries(() => judgePair(type, left, right, context))), hints: hintHash(left, right) };
          done += 1;
          if (done % SAVE_EVERY === 0) { await persist(); console.log(`  ${done}/${pending.length} pairs judged`); }
        } catch (error) {
          failed.push(`${left.model_id} vs ${right.model_id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }));
    await persist();
    console.log(`Judged ${done} new ${type} pairs.`);
    if (failed.length) console.warn(`${failed.length} pairs failed and will be retried next build:\n  ${failed.slice(0, 10).join("\n  ")}`);
  }

  const scores = computeScores(set.criteria, models, store);
  const judgedAt = Object.values(store.pairs).map((pair) => pair.judged_at).sort().at(-1) ?? null;
  await writeFile(scoresPath, `${JSON.stringify({ criteria_version: set.version, judged_at: judgedAt, models: scores }, null, 2)}\n`);
  console.log(`Model scores computed for ${Object.keys(scores).length} ${type} models from ${Object.keys(store.pairs).length} cached pairs.`);
}

async function main() {
  const snapshot = JSON.parse(await readFile(SNAPSHOT, "utf8"));
  const context = {
    hints: await readJson(HINTS, {}),
    usage: new Map(snapshot.models.map((entry) => [entry.model.model_id, entry.metrics?.points ?? []])),
    token: loadToken(),
  };
  for (const type of Object.keys(TYPES)) {
    try {
      await scoreType(type, snapshot.models, context);
    } catch (error) {
      console.warn(`Model scoring skipped for ${type}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

main().catch((error) => {
  console.warn(`Model scoring skipped: ${error instanceof Error ? error.message : String(error)}`);
});
