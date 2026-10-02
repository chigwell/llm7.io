import * as fs from "node:fs/promises";
import { dirname } from "node:path";
import { createPublicRequester } from "./http.mjs";
import { mapLimit } from "./concurrency.mjs";
import { MODEL_TYPES } from "../../lib/models/model-types.js";
import {
  listResponse,
  detailResponse,
  metricsResponse,
  summaryResponse,
  versionResponse,
  liveVideoPricingResponse,
  validate,
  stripInternalRouteFields,
  assertNoDeniedFields,
} from "./schemas.mjs";
const API_BASE = "https://api.llm7.io/public/v1";
const CONCURRENCY = 6;

export async function syncPublicModelData({
  snapshotPath,
  fetchImpl = fetch,
  sleep,
  now = () => new Date(),
  log = console.log,
  filesystem = fs,
} = {}) {
  const SNAPSHOT_PATH = snapshotPath;
  const { mkdir, readFile, rename, writeFile } = filesystem;
  const loadPrevious = async () => {
    try {
      return JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
    } catch (error) {
      if (error?.code === "ENOENT") return null;
      throw error;
    }
  };
  const previous = await loadPrevious();
  const previousEtags = previous?.metadata?.etags ?? {};
  const etags = {};
  const requestJson = createPublicRequester({
    previousEtags,
    fetchImpl,
    sleep,
  });
  const livePricingUrl = "https://api.llm7.io/v1/models";
  // This endpoint is also used by the live pricing cards and exposes the complete
  // public video rate matrix, which the catalogue endpoint currently summarizes.
  delete previousEtags[livePricingUrl];
  const livePricingResult = await requestJson(livePricingUrl, undefined, etags);
  const liveVideoPricing = liveVideoPricingResponse.parse(
    livePricingResult.value,
  );
  const videoPricingById = new Map(
    liveVideoPricing.data.flatMap((model) => {
      const routes = stripInternalRouteFields(
        model.pricing.route_prices_usd_per_second,
      );
      assertNoDeniedFields(routes, `live-pricing.${model.id}`);
      return routes?.length ? [[model.id, routes]] : [];
    }),
  );
  const withVideoPricing = (model) => {
    const routes =
      model.model_type === "video"
        ? videoPricingById.get(model.model_id)
        : undefined;
    return routes
      ? {
          ...model,
          pricing: { ...model.pricing, route_prices_usd_per_second: routes },
        }
      : model;
  };
  const versionUrl = `${API_BASE}/models/version`;
  const version = validate(
    versionResponse,
    (await requestJson(versionUrl, previous?.version, etags)).value,
    "version",
  );
  const firstListUrl = `${API_BASE}/models?status=all&page_size=100&metrics_window=30d&page=1`;
  const parsedFirstList = validate(
    listResponse,
    (await requestJson(firstListUrl, previous?.list_pages?.[0], etags)).value,
    "models.1",
  );
  const firstList = {
    ...parsedFirstList,
    data: parsedFirstList.data.map(withVideoPricing),
  };
  const pages = [firstList];
  const pageNumbers = Array.from(
    { length: Math.max(firstList.pagination.total_pages - 1, 0) },
    (_, index) => index + 2,
  );
  const remaining = await mapLimit(pageNumbers, CONCURRENCY, async (page) => {
    const url = `${API_BASE}/models?status=all&page_size=100&metrics_window=30d&page=${page}`;
    const parsed = validate(
      listResponse,
      (await requestJson(url, previous?.list_pages?.[page - 1], etags)).value,
      `models.${page}`,
    );
    return { ...parsed, data: parsed.data.map(withVideoPricing) };
  });
  pages.push(...remaining);
  const listed = pages.flatMap((page) => page.data);
  if (listed.length !== firstList.pagination.total_items)
    throw new Error(
      `Model pagination total mismatch: expected ${firstList.pagination.total_items}, got ${listed.length}`,
    );
  const ids = new Set();
  const slugs = new Set();
  for (const model of listed) {
    if (ids.has(model.model_id))
      throw new Error(`Duplicate model_id ${model.model_id}`);
    if (slugs.has(model.slug)) throw new Error(`Duplicate slug ${model.slug}`);
    ids.add(model.model_id);
    slugs.add(model.slug);
  }

  const records = await mapLimit(listed, CONCURRENCY, async (listedModel) => {
    const previousEntry = previous?.models?.find(
      (entry) => entry.model.slug === listedModel.slug,
    );
    const detailUrl = `${API_BASE}/models/${encodeURIComponent(listedModel.slug)}`;
    const detailResult = await requestJson(
      detailUrl,
      previousEntry?.model,
      etags,
    );
    const model = withVideoPricing(
      validate(detailResponse, detailResult.value, `model.${listedModel.slug}`),
    );
    const canonicalSlug =
      new URL(detailResult.canonicalUrl).pathname
        .split("/")
        .filter(Boolean)
        .at(-1) || model.slug;
    if (canonicalSlug !== model.slug)
      throw new Error(
        `Canonical detail URL and slug disagree for ${listedModel.slug}`,
      );
    const metricsUrl = `${API_BASE}/models/${encodeURIComponent(model.slug)}/metrics?range=30d&interval=1d`;
    const metrics = validate(
      metricsResponse,
      (await requestJson(metricsUrl, previousEntry?.metrics, etags)).value,
      `metrics.${model.slug}`,
    );
    return { model, metrics };
  });
  const summaryUrl = `${API_BASE}/statistics/summary?range=30d`;
  const summary = validate(
    summaryResponse,
    (await requestJson(summaryUrl, previous?.summary, etags)).value,
    "summary",
  );
  const models = records
    .map(({ model, metrics }) => ({ model, metrics }))
    .sort((a, b) => a.model.slug.localeCompare(b.model.slug));
  const canonicalIds = new Set();
  const canonicalSlugs = new Set();
  for (const { model } of models) {
    if (canonicalIds.has(model.model_id))
      throw new Error(`Duplicate canonical model_id ${model.model_id}`);
    if (canonicalSlugs.has(model.slug))
      throw new Error(`Duplicate canonical slug ${model.slug}`);
    canonicalIds.add(model.model_id);
    canonicalSlugs.add(model.slug);
  }
  const active = models.filter((entry) => entry.model.status === "active");
  const countByType = (type) =>
    active.filter((entry) => entry.model.model_type === type).length;
  const pairCount = (n) => (n * (n - 1)) / 2;
  // Full model-history responses are intentionally excluded: the public pages do not
  // render them, and embedding the complete history makes the static export too large.
  const snapshot = {
    metadata: {
      generated_at: now().toISOString(),
      api_base: API_BASE,
      catalog_version: version.catalog_version,
      catalog_updated_at: version.catalog_updated_at,
      latest_metrics_bucket: version.latest_metrics_bucket,
      etags,
    },
    version,
    list_pages: pages.sort((a, b) => a.pagination.page - b.pagination.page),
    models,
    summary,
  };
  await mkdir(dirname(SNAPSHOT_PATH), { recursive: true });
  const temporary = `${SNAPSHOT_PATH}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
  await rename(temporary, SNAPSHOT_PATH);
  log(`total public models: ${models.length}`);
  log(`active models: ${active.length}`);
  log(`retired models: ${models.length - active.length}`);
  for (const type of MODEL_TYPES) log(`${type} models: ${countByType(type)}`);
  log(
    `generated comparison count by type: ${MODEL_TYPES.map((type) => `${type} ${pairCount(countByType(type))}`).join(", ")}`,
  );
  log(
    `total generated comparison count: ${MODEL_TYPES.reduce((sum, type) => sum + pairCount(countByType(type)), 0)}`,
  );
  log(`catalog version: ${version.catalog_version}`);
  log(
    `latest metrics bucket: ${version.latest_metrics_bucket ?? "not available"}`,
  );
  return snapshot;
}
