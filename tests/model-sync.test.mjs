import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPublicRequester } from "../scripts/models/http.mjs";
import { syncPublicModelData } from "../scripts/models/synchronize.mjs";
import {
  models,
  version,
  summary,
  metrics,
  listPage,
  timestamp,
} from "./fixtures/models.mjs";
const response = (status, value = {}, etag = "v1") => ({
  status,
  ok: status >= 200 && status < 300,
  url: "",
  headers: new Headers({ etag }),
  json: async () => structuredClone(value),
});

test("transport retries server failures and retains ETag/304 semantics", async () => {
  const calls = [],
    delays = [];
  let attempt = 0;
  const request = createPublicRequester({
    previousEtags: { endpoint: "old" },
    sleep: async (ms) => delays.push(ms),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return response(++attempt < 3 ? 503 : 200, { value: 1 });
    },
  });
  const etags = {};
  assert.deepEqual(await request("endpoint", undefined, etags), {
    value: { value: 1 },
    canonicalUrl: "endpoint",
  });
  assert.deepEqual(delays, [250, 500]);
  assert.equal(calls.length, 3);
  assert.equal(calls[0].options.headers["If-None-Match"], "old");
  assert.equal(calls[0].options.redirect, "follow");
  assert.deepEqual(etags, { endpoint: "v1" });
  const cached = createPublicRequester({
    fetchImpl: async () => response(304),
  });
  assert.deepEqual((await cached("endpoint", { old: true }, {})).value, {
    old: true,
  });
  await assert.rejects(cached("endpoint", undefined, {}), /304 without/);
});
test("permanent failures do not retry and requests stay within six concurrent fetches", async () => {
  let count = 0;
  const request = createPublicRequester({
    fetchImpl: async () => {
      count++;
      return response(404);
    },
  });
  await assert.rejects(request("missing", undefined, {}), /Permanent HTTP 404/);
  assert.equal(count, 1);
  let active = 0,
    peak = 0;
  const pending = [];
  const limited = createPublicRequester({
    fetchImpl: () => {
      active++;
      peak = Math.max(peak, active);
      return new Promise((resolve) =>
        pending.push(() => {
          active--;
          resolve(response(200));
        }),
      );
    },
  });
  const all = Promise.all(
    Array.from({ length: 14 }, (_, i) => limited(String(i), undefined, {})),
  );
  while (count < 100) {
    await new Promise((resolve) => setImmediate(resolve));
    while (pending.length) pending.shift()();
    if (active === 0 && peak > 0 && count++ > 10) break;
  }
  await all;
  assert.equal(peak, 6);
});
function fixtureFetch(calls, invalid = false) {
  return async (url, options) => {
    calls.push({ url, headers: options.headers });
    const u = new URL(url);
    if (u.pathname === "/v1/models")
      return response(200, {
        data: [
          {
            id: "video-one",
            pricing: {
              route_prices_usd_per_second: [
                {
                  request_type: "text",
                  price_tiers_usd_per_second: [
                    {
                      public_price_usd_per_second: "0.04",
                      atlascloud_routes: [{ provider: "private" }],
                    },
                  ],
                },
              ],
            },
          },
        ],
      });
    if (u.pathname.endsWith("/version")) return response(200, version);
    if (u.pathname.endsWith("/summary")) return response(200, summary);
    if (u.pathname.endsWith("/metrics")) return response(200, metrics);
    if (u.pathname === "/public/v1/models") {
      const page = listPage(Number(u.searchParams.get("page")));
      if (invalid) page.pagination.total_items = 6;
      return response(200, page);
    }
    const model = models.find((m) => u.pathname.endsWith("/" + m.slug));
    assert(model, url);
    return response(200, model);
  };
}
test("synchronizer preserves pagination, enrichment, ordering, and atomic output on failure", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "llm7-sync-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const snapshotPath = join(dir, "snapshot.json");
  const calls = [];
  const snapshot = await syncPublicModelData({
    snapshotPath,
    fetchImpl: fixtureFetch(calls),
    now: () => new Date(timestamp),
    log: () => {},
  });
  assert.deepEqual(
    snapshot,
    JSON.parse(
      await readFile(
        new URL("./fixtures/synchronized-snapshot.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  assert.deepEqual(
    snapshot.models.map((e) => e.model.slug),
    ["chat-a", "chat-b", "image-one", "retired-chat", "video-one"],
  );
  assert.equal(snapshot.list_pages.length, 2);
  assert.equal(calls.length, 15);
  assert.equal(
    snapshot.models.at(-1).model.pricing.route_prices_usd_per_second[0]
      .price_tiers_usd_per_second[0].public_price_usd_per_second,
    "0.04",
  );
  assert(!JSON.stringify(snapshot).includes("atlascloud_routes"));
  const saved = await readFile(snapshotPath, "utf8");
  assert.deepEqual(JSON.parse(saved), snapshot);
  await assert.rejects(
    syncPublicModelData({
      snapshotPath,
      fetchImpl: fixtureFetch([], true),
      log: () => {},
    }),
    /pagination total mismatch/,
  );
  assert.equal(await readFile(snapshotPath, "utf8"), saved);
  await writeFile(snapshotPath, "invalid-json");
  await assert.rejects(
    syncPublicModelData({
      snapshotPath,
      fetchImpl: () => {
        throw new Error("should not fetch");
      },
    }),
    SyntaxError,
  );
});

test("cached 304 refresh keeps the same complete snapshot and always fetches live video pricing", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "llm7-cached-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const snapshotPath = join(dir, "snapshot.json");
  const original = JSON.parse(
    await readFile(
      new URL("./fixtures/synchronized-snapshot.json", import.meta.url),
      "utf8",
    ),
  );
  await writeFile(snapshotPath, JSON.stringify(original));
  const fresh = fixtureFetch([]);
  const result = await syncPublicModelData({
    snapshotPath,
    now: () => new Date(timestamp),
    log: () => {},
    fetchImpl: async (url, options) => {
      if (new URL(url).pathname === "/v1/models") {
        assert.equal(options.headers["If-None-Match"], undefined);
        return fresh(url, options);
      }
      assert.equal(options.headers["If-None-Match"], "v1");
      return response(304);
    },
  });
  assert.deepEqual(result, original);
});

test("duplicate IDs and canonical URL disagreement fail before replacing existing data", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "llm7-invalid-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const snapshotPath = join(dir, "snapshot.json");
  const saved = await readFile(
    new URL("./fixtures/synchronized-snapshot.json", import.meta.url),
    "utf8",
  );
  await writeFile(snapshotPath, saved);
  for (const variant of ["duplicate", "canonical"]) {
    const fresh = fixtureFetch([]);
    await assert.rejects(
      syncPublicModelData({
        snapshotPath,
        log: () => {},
        fetchImpl: async (url, options) => {
          const result = await fresh(url, options);
          if (
            variant === "duplicate" &&
            new URL(url).pathname === "/public/v1/models"
          ) {
            const value = await result.json();
            value.data[1] = value.data[0];
            return response(200, value);
          }
          if (variant === "canonical" && url.endsWith("/chat-a"))
            result.url = "https://api.llm7.io/public/v1/models/wrong";
          return result;
        },
      }),
      variant === "duplicate" ? /Duplicate model_id/ : /Canonical detail URL/,
    );
    assert.equal(await readFile(snapshotPath, "utf8"), saved);
  }
});
