#!/usr/bin/env node
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";

const API_BASE = "https://api.llm7.io/public/v1";
const ROOT = resolve(new URL("..", import.meta.url).pathname);
const SNAPSHOT_PATH = resolve(ROOT, "data/generated/public-model-data.json");
const RETRIES = 3;
const CONCURRENCY = 6;
const DECIMAL = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const DENIED = /(?:^|_)(?:provider|owned_by|supplier|vendor|upstream_model|deployment|backend|hostname|region|internal_cost|margin)(?:$|_)/i;
let previousEtags = {};
let requestsInFlight = 0;
const requestWaiters = [];
const timestamp = z.string().refine((value) => Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.now() + 10 * 60_000, "invalid timestamp");
const decimal = z.string().regex(DECIMAL, "invalid decimal string");
const nonNegative = z.number().finite().nonnegative();
const nullableNonNegative = nonNegative.nullable();
const rate = z.number().finite().min(0).max(1).nullable();
const pagination = z.object({ page: z.number().int().positive(), page_size: z.number().int().positive(), total_items: z.number().int().nonnegative(), total_pages: z.number().int().positive() });
const cachePricing = z.object({ cached_input: decimal.optional(), cached_output: decimal.optional(), cache_read: decimal.optional(), cache_write: decimal.optional() });
const pricing = z.object({
  mode: z.enum(["token", "image", "second"]),
  currency: z.string().min(1),
  unit: z.string().min(1),
  minimum_request_usd: decimal.nullable().optional(),
  input: decimal.optional(),
  output: decimal.optional(),
  price: decimal.optional(),
  cached_input: decimal.optional(),
  cached_output: decimal.optional(),
  cache_read: decimal.optional(),
  cache_write: decimal.optional(),
  public_price_usd_per_million: cachePricing.optional(),
}).superRefine((value, ctx) => {
  if (value.mode === "token" && (!value.input || !value.output)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "token prices require input and output" });
  if (value.mode !== "token" && !value.price) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "unit price required" });
});
const statistics = z.object({
  window: z.string(), requests_total: nonNegative, upstream_attempts: nonNegative, successful_requests: nonNegative, client_errors_4xx: nonNegative, server_errors_5xx: nonNegative, timeouts: nonNegative, rate_limited_429: nonNegative, cancelled_requests: nonNegative, success_rate: rate,
  input_tokens: nonNegative, output_tokens: nonNegative, images_generated: nonNegative, videos_generated: nonNegative, video_seconds_generated: decimal, jobs_started: nonNegative, jobs_succeeded: nonNegative, jobs_failed: nonNegative, jobs_cancelled: nonNegative, job_success_rate: rate,
  latency_observations: nonNegative, latency_avg_ms: nullableNonNegative, latency_p50_ms: nullableNonNegative, latency_p95_ms: nullableNonNegative, ttft_observations: nonNegative, ttft_avg_ms: nullableNonNegative, ttft_p50_ms: nullableNonNegative, ttft_p95_ms: nullableNonNegative, first_bucket: timestamp.nullable(), last_bucket: timestamp.nullable(),
});
const apiInterface = z.object({ path: z.string().startsWith("/"), method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]), schema: z.string().min(1), docs_url: z.string().url().nullable(), operation: z.string().min(1), asynchronous: z.boolean() });
const modelCore = z.object({
  model_id: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).refine((slug) => !slug.includes("--")), display_name: z.string().min(1), status: z.enum(["active", "retired"]), model_type: z.enum(["chat", "image", "video"]), tier: z.string().nullable().optional(), pricing,
  context_window: z.object({ tokens: nullableNonNegative, chars: nullableNonNegative }), modalities: z.object({ input: z.array(z.string()), output: z.array(z.string()) }), capabilities: z.object({ tools: z.boolean().nullable().optional(), stream: z.boolean().nullable().optional(), vision: z.boolean().nullable().optional(), json_mode: z.boolean().nullable().optional(), reasoning: z.boolean().nullable().optional(), image_generation: z.boolean().nullable().optional(), image_edits: z.boolean().nullable().optional(), video_generation: z.boolean().nullable().optional(), video_async: z.boolean().nullable().optional(), max_reference_images: nullableNonNegative.optional(), max_reference_image_bytes: nullableNonNegative.optional(), supported_sizes: z.array(z.string()).optional(), supported_seconds: z.array(nonNegative).optional(), requires_reference_image: z.boolean().nullable().optional() }).passthrough(),
  schema_endpoints: z.array(z.string()), api_interfaces: z.array(apiInterface).min(1), usage_based_only: z.boolean().nullable().optional(), stream: z.boolean().nullable().optional(), json_mode: z.boolean().nullable().optional(), reasoning: z.boolean().nullable().optional(), tools_calling: z.boolean().nullable().optional(), source_created_at: timestamp.nullable().optional(), first_seen_at: timestamp.optional(), updated_at: timestamp.optional(),
}).passthrough();
const listResponse = z.object({ data: z.array(modelCore.extend({ statistics, first_seen_at: timestamp, updated_at: timestamp })), pagination, catalog_version: z.string().min(1), catalog_updated_at: timestamp, metrics_snapshot_at: timestamp.nullable() });
const detailResponse = modelCore.extend({ first_seen_at: timestamp, updated_at: timestamp, statistics: z.record(statistics).optional(), data_available_from: timestamp.nullable().optional(), latest_metrics_bucket: timestamp.nullable().optional(), related_models: z.array(modelCore).optional() });
const metricPoint = statistics.omit({ window: true, first_bucket: true, last_bucket: true }).extend({ bucket_start: timestamp });
const metricsResponse = z.object({ range: z.string(), interval: z.string(), points: z.array(metricPoint), sample_size: nonNegative, data_available_from: timestamp.nullable(), latest_complete_bucket: timestamp.nullable(), generated_at: timestamp });
const summaryResponse = z.object({ range: z.string(), models: z.object({ total: nonNegative, active: nonNegative, retired: nonNegative, chat: nonNegative, image: nonNegative, video: nonNegative, models_with_requests: nonNegative }), requests: z.object({ total: nonNegative, successful: nonNegative, client_errors_4xx: nonNegative, server_errors_5xx: nonNegative, timeouts: nonNegative, rate_limited_429: nonNegative, cancelled: nonNegative, success_rate: rate }), usage: z.object({ input_tokens: nonNegative, output_tokens: nonNegative, images_generated: nonNegative, videos_generated: nonNegative, video_seconds_generated: decimal }), jobs: z.object({ started: nonNegative, succeeded: nonNegative, failed: nonNegative, cancelled: nonNegative, success_rate: rate }), latency: z.object({ observations: nonNegative, average_ms: nullableNonNegative, p50_ms: nullableNonNegative, p95_ms: nullableNonNegative }), data_available_from: timestamp.nullable(), latest_complete_bucket: timestamp.nullable(), generated_at: timestamp });
const versionResponse = z.object({ schema_version: z.number().int().positive(), catalog_version: z.string().min(1), catalog_updated_at: timestamp, latest_metrics_bucket: timestamp.nullable() });

function assertNoDeniedFields(value, path = "public") {
  if (Array.isArray(value)) return value.forEach((entry, index) => assertNoDeniedFields(entry, `${path}[${index}]`));
  if (value && typeof value === "object") for (const [key, entry] of Object.entries(value)) {
    if (DENIED.test(key)) throw new Error(`Provider-related field rejected: ${path}.${key}`);
    assertNoDeniedFields(entry, `${path}.${key}`);
  }
}

function stripInternalRouteFields(value) {
  if (Array.isArray(value)) return value.map(stripInternalRouteFields);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(Object.entries(value).flatMap(([key, entry]) => {
    if (key === "atlascloud_routes") return [];
    return [[key, stripInternalRouteFields(entry)]];
  }));
}

function validate(schema, value, label) {
  const parsed = stripInternalRouteFields(schema.parse(value));
  assertNoDeniedFields(parsed, label);
  return parsed;
}

async function loadPrevious() {
  try { return JSON.parse(await readFile(SNAPSHOT_PATH, "utf8")); } catch (error) { if (error?.code === "ENOENT") return null; throw error; }
}

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
async function acquireRequestSlot() {
  if (requestsInFlight >= CONCURRENCY) await new Promise((resolvePromise) => requestWaiters.push(resolvePromise));
  requestsInFlight += 1;
}
function releaseRequestSlot() {
  requestsInFlight -= 1;
  requestWaiters.shift()?.();
}
async function fetchPublic(url, headers) {
  await acquireRequestSlot();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, { redirect: "follow", signal: controller.signal, headers });
  } finally {
    clearTimeout(timeout);
    releaseRequestSlot();
  }
}
async function requestJson(url, prior, etags) {
  const previousEtag = previousEtags[url];
  let failure;
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    try {
      const response = await fetchPublic(url, previousEtag ? { "If-None-Match": previousEtag } : {});
      const responseEtag = response.headers.get("etag") ?? previousEtag;
      if (response.status === 304) {
        if (prior === undefined) throw new Error(`304 without a previously validated response for ${url}`);
        if (responseEtag) etags[url] = responseEtag;
        return { value: prior, canonicalUrl: response.url || url };
      }
      if (response.ok) {
        const value = await response.json();
        if (responseEtag) etags[url] = responseEtag;
        return { value, canonicalUrl: response.url || url };
      }
      if (response.status < 500) throw new Error(`Permanent HTTP ${response.status} for ${url}`);
      failure = new Error(`HTTP ${response.status} for ${url}`);
    } catch (error) {
      if (String(error?.message ?? error).startsWith("Permanent HTTP") || String(error?.message ?? error).includes("304 without")) throw error;
      failure = error;
    }
    if (attempt < RETRIES - 1) await sleep(250 * 2 ** attempt);
  }
  throw failure ?? new Error(`Unable to request ${url}`);
}

async function mapLimit(values, limit, worker) {
  const result = new Array(values.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (next < values.length) {
      const index = next++;
      result[index] = await worker(values[index], index);
    }
  }));
  return result;
}

async function main() {
  const previous = await loadPrevious();
  previousEtags = previous?.metadata?.etags ?? {};
  const etags = {};
  const versionUrl = `${API_BASE}/models/version`;
  const version = validate(versionResponse, (await requestJson(versionUrl, previous?.version, etags)).value, "version");
  const firstListUrl = `${API_BASE}/models?status=all&page_size=100&metrics_window=30d&page=1`;
  const firstList = validate(listResponse, (await requestJson(firstListUrl, previous?.list_pages?.[0], etags)).value, "models.1");
  const pages = [firstList];
  const pageNumbers = Array.from({ length: Math.max(firstList.pagination.total_pages - 1, 0) }, (_, index) => index + 2);
  const remaining = await mapLimit(pageNumbers, CONCURRENCY, async (page) => {
    const url = `${API_BASE}/models?status=all&page_size=100&metrics_window=30d&page=${page}`;
    return validate(listResponse, (await requestJson(url, previous?.list_pages?.[page - 1], etags)).value, `models.${page}`);
  });
  pages.push(...remaining);
  const listed = pages.flatMap((page) => page.data);
  if (listed.length !== firstList.pagination.total_items) throw new Error(`Model pagination total mismatch: expected ${firstList.pagination.total_items}, got ${listed.length}`);
  const ids = new Set(); const slugs = new Set();
  for (const model of listed) { if (ids.has(model.model_id)) throw new Error(`Duplicate model_id ${model.model_id}`); if (slugs.has(model.slug)) throw new Error(`Duplicate slug ${model.slug}`); ids.add(model.model_id); slugs.add(model.slug); }

  const records = await mapLimit(listed, CONCURRENCY, async (listedModel) => {
    const previousEntry = previous?.models?.find((entry) => entry.model.slug === listedModel.slug);
    const detailUrl = `${API_BASE}/models/${encodeURIComponent(listedModel.slug)}`;
    const detailResult = await requestJson(detailUrl, previousEntry?.model, etags);
    const model = validate(detailResponse, detailResult.value, `model.${listedModel.slug}`);
    const canonicalSlug = new URL(detailResult.canonicalUrl).pathname.split("/").filter(Boolean).at(-1) || model.slug;
    if (canonicalSlug !== model.slug) throw new Error(`Canonical detail URL and slug disagree for ${listedModel.slug}`);
    const metricsUrl = `${API_BASE}/models/${encodeURIComponent(model.slug)}/metrics?range=30d&interval=1d`;
    const metrics = validate(metricsResponse, (await requestJson(metricsUrl, previousEntry?.metrics, etags)).value, `metrics.${model.slug}`);
    return { model, metrics };
  });
  const summaryUrl = `${API_BASE}/statistics/summary?range=30d`;
  const summary = validate(summaryResponse, (await requestJson(summaryUrl, previous?.summary, etags)).value, "summary");
  const models = records.map(({ model, metrics }) => ({ model, metrics })).sort((a, b) => a.model.slug.localeCompare(b.model.slug));
  const canonicalIds = new Set(); const canonicalSlugs = new Set();
  for (const { model } of models) {
    if (canonicalIds.has(model.model_id)) throw new Error(`Duplicate canonical model_id ${model.model_id}`);
    if (canonicalSlugs.has(model.slug)) throw new Error(`Duplicate canonical slug ${model.slug}`);
    canonicalIds.add(model.model_id); canonicalSlugs.add(model.slug);
  }
  const active = models.filter((entry) => entry.model.status === "active");
  const countByType = (type) => active.filter((entry) => entry.model.model_type === type).length;
  const pairCount = (n) => (n * (n - 1)) / 2;
  // Full model-history responses are intentionally excluded: the public pages do not
  // render them, and embedding the complete history makes the static export too large.
  const snapshot = { metadata: { generated_at: new Date().toISOString(), api_base: API_BASE, catalog_version: version.catalog_version, catalog_updated_at: version.catalog_updated_at, latest_metrics_bucket: version.latest_metrics_bucket, etags }, version, list_pages: pages.sort((a, b) => a.pagination.page - b.pagination.page), models, summary };
  await mkdir(dirname(SNAPSHOT_PATH), { recursive: true });
  const temporary = `${SNAPSHOT_PATH}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(temporary, SNAPSHOT_PATH);
  console.log(`total public models: ${models.length}`);
  console.log(`active models: ${active.length}`);
  console.log(`retired models: ${models.length - active.length}`);
  console.log(`chat models: ${countByType("chat")}`);
  console.log(`image models: ${countByType("image")}`);
  console.log(`video models: ${countByType("video")}`);
  console.log(`generated comparison count by type: chat ${pairCount(countByType("chat"))}, image ${pairCount(countByType("image"))}, video ${pairCount(countByType("video"))}`);
  console.log(`total generated comparison count: ${pairCount(countByType("chat")) + pairCount(countByType("image")) + pairCount(countByType("video"))}`);
  console.log(`catalog version: ${version.catalog_version}`);
  console.log(`latest metrics bucket: ${version.latest_metrics_bucket ?? "not available"}`);
}

main().catch((error) => { console.error(`Public model synchronisation failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
