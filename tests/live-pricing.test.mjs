import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./support/load-typescript.mjs";

const { currentPricing, withoutSnapshotPrices, withCurrentPricing } = loadTypeScript("lib/models/current-pricing.ts");
const { createLiveModelsStore, isApiModelsResponse } = loadTypeScript("lib/models/live-models-store.ts");
const { estimate } = await import("../lib/discovery/pages.js");
const { model: fixtureModel } = await import("./fixtures/models.mjs");
const model = (overrides = {}) => ({ id: "test", model_type: "chat", pricing_mode: "token", pricing: { input: 3, output: 15, currency: "USD", unit: "1M tokens" }, ...overrides });
const payload = (...models) => ({ object: "list", data: models });

test("live prices validate decimals, free rates, currency, mode and billing units", () => {
  assert.equal(currentPricing(model()).pricing.input, "3");
  assert.equal(currentPricing(model({ pricing: { ...model().pricing, input: 0, output: 1e-8 } })).pricing.output, "0.00000001");
  for (const changes of [{ input: -1 }, { input: Infinity }, { output: undefined }, { input: null }, { input: true }, { currency: "EUR" }, { unit: "0 tokens" }, { unit: "request" }]) {
    assert.equal(currentPricing(model({ pricing: { ...model().pricing, ...changes } })), null, JSON.stringify(changes));
  }
  const audio = model({ model_type: "audio_to_text", pricing_mode: "second", pricing: { price: "0.0001", unit: "second", currency: "USD" } });
  assert.equal(currentPricing(audio).pricing.price, "0.0001");
  assert.equal(currentPricing({ ...audio, pricing: { ...audio.pricing, unit: "minute" } }), null);
});

test("cache rates normalize per-million amounts and a refresh removes obsolete cache/minimum fields", () => {
  const fresh = currentPricing(model({ pricing: { ...model().pricing, unit: "1k tokens", cache_read: 999, public_price_usd_per_million: { cache_read: 0.3, cached_input: 0 }, minimum_request_price_usd: 0.01, minimum_cache_tokens: 2048 } }));
  assert.equal(fresh.pricing.cache_read, "0.0003");
  assert.equal(fresh.pricing.cached_input, "0");
  assert.equal(fresh.pricing.minimum_request_usd, "0.01");
  assert.equal(fresh.minimumCacheTokens, 2048);
  const metadata = fixtureModel("test");
  metadata.pricing = fresh.pricing;
  const updated = withCurrentPricing(metadata, currentPricing(model()));
  assert.equal(updated.pricing.cache_read, undefined);
  assert.equal(updated.pricing.minimum_request_usd, undefined);
  assert.equal(withoutSnapshotPrices(metadata).pricing.input, undefined);
  assert.equal(estimate(withCurrentPricing(metadata), "100", "1000", "500").cost, null, "unverified rates never become zero-cost estimates");
});

test("video pricing exposes only public fields; quotes do not require a fixed price", () => {
  const video = model({ model_type: "video", pricing_mode: "second", pricing: { price: 0.2, unit: "second", currency: "USD", route_prices_usd_per_second: [{ request_type: "image-to-video", provider_name: "private", price_tiers_usd_per_second: [{ resolution: "720p", public_price_usd_per_second: 0.1, internal_cost: 0.001 }] }] } });
  const normalized = currentPricing(video);
  assert.equal(normalized.pricing.route_prices_usd_per_second[0].price_tiers_usd_per_second[0].public_price_usd_per_second, "0.1");
  assert.doesNotMatch(JSON.stringify(normalized), /private|internal_cost|provider_name/);
  assert.ok(currentPricing({ ...video, pricing: { unit: "second", currency: "USD", billing_strategy: "provider_quote" } }));
  assert.equal(currentPricing({ ...video, pricing: { unit: "second", currency: "USD" } }), null);
});

test("one request and refresh timer serve all subscribers, including late arrivals", async t => {
  t.mock.timers.enable({ apis: ["setInterval"] });
  let now = 100, calls = 0;
  const seen = [];
  const store = createLiveModelsStore({ now: () => now, refreshIntervalMs: 1000, fetcher: async (url, options) => {
    calls++; seen.push(options);
    return Response.json(payload(model({ pricing: { ...model().pricing, input: calls } })));
  } });
  const a = store.subscribe(() => {}), b = store.subscribe(() => {});
  await store.refresh();
  assert.equal(calls, 1);
  const c = store.subscribe(() => {});
  await store.refresh();
  assert.equal(calls, 1);
  now += 999; // Response completion need not align with the interval's start.
  t.mock.timers.tick(1000);
  await store.refresh();
  assert.equal(calls, 2);
  assert.equal(store.getSnapshot().prices.get("test").pricing.input, "2");
  assert.equal(seen[0].credentials, "omit");
  assert.equal(seen[0].cache, "no-store");
  a(); b(); c();
  now += 1000; t.mock.timers.tick(1000);
  await Promise.resolve();
  assert.equal(calls, 2, "last unsubscribe stops polling");
  assert.equal(store.getServerSnapshot().models, null, "SSR never leaks another request's cached rates");
});

test("failed refreshes invalidate pricing; removed or malformed models never reuse old rates", async () => {
  let result = payload(model());
  const store = createLiveModelsStore({ fetcher: async () => result instanceof Error ? Promise.reject(result) : Response.json(result) });
  await store.refresh();
  result = new Error("offline");
  await store.refresh(true);
  assert.equal(store.getSnapshot().state, "error");
  assert.equal(store.getSnapshot().prices.size, 0);
  assert.equal(store.getSnapshot().models[0].id, "test", "labelled homepage fallback remains available");
  result = payload(model({ pricing: { input: 2 } }));
  await store.refresh(true);
  assert.equal(store.getSnapshot().prices.size, 0);
  result = payload();
  await store.refresh(true);
  assert.equal(store.getSnapshot().models.length, 0);
  result = payload(model(), model());
  await store.refresh(true);
  assert.equal(store.getSnapshot().state, "error");
  assert.equal(isApiModelsResponse({ data: [null] }), false);
  result = payload(model());
  await store.refresh(true);
  assert.equal(store.getSnapshot().state, "ready");
  assert.equal(store.getSnapshot().prices.get("test").pricing.output, "15");
});

test("timeout includes body parsing; late responses cannot restore expired prices", async () => {
  let resolveBody, signal;
  const store = createLiveModelsStore({ timeoutMs: 5, fetcher: async (_, options) => {
    signal = options.signal;
    return { ok: true, json: () => new Promise(resolve => { resolveBody = resolve; }) };
  } });
  await store.refresh();
  assert.equal(signal.aborted, true);
  assert.equal(store.getSnapshot().state, "error");
  resolveBody(payload(model()));
  await Promise.resolve(); await Promise.resolve();
  assert.equal(store.getSnapshot().prices.size, 0);
});
