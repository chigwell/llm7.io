import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { loadTypeScript } from "./support/load-typescript.mjs";

const { default: ModelPricing, LivePrice, LiveComparisonPricing } = loadTypeScript("components/models/LiveModelPricing.client.tsx");
const { createLiveModelsStore, liveModelsStore } = loadTypeScript("lib/models/live-models-store.ts");
const { default: Explorer } = loadTypeScript("components/discovery/Explorer.client.tsx");
const { default: CatalogueControls } = loadTypeScript("components/models/ModelCatalogueControls.client.tsx");
const { default: TokenBudget } = loadTypeScript("components/models/LiveTokenBudgetCalculator.client.tsx");
const { model: metadata } = await import("./fixtures/models.mjs");
const apiModel = (id, input = 3, output = 15) => ({ id, model_type: "chat", pricing_mode: "token", pricing: { input, output, currency: "USD", unit: "1M tokens" } });

async function mount(t, element, data = [apiModel("test")], options = {}) {
  const dom = new JSDOM('<div id="root"></div>', { url: "https://llm7.io/", pretendToBeVisual: true });
  const restores = [];
  for (const [key, value] of Object.entries({ window: dom.window, self: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })) {
    const before = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    restores.push(() => before ? Object.defineProperty(globalThis, key, before) : delete globalThis[key]);
  }
  let result = data, calls = 0;
  Object.assign(liveModelsStore, createLiveModelsStore({ ...options, fetcher: async () => {
    calls++;
    if (result instanceof Error) throw result;
    return Response.json({ data: result });
  } }));
  const root = createRoot(document.getElementById("root"));
  t.after(async () => { await act(async () => root.unmount()); dom.window.close(); restores.forEach(fn => fn()); });
  await act(async () => { root.render(element); await liveModelsStore.refresh(); });
  return { get calls() { return calls; }, setResponse(next) { result = next; }, async refresh(next) { result = next; await act(async () => liveModelsStore.refresh(true)); } };
}

test("SSR includes the pricing section and API link without frozen monetary amounts", () => {
  const html = renderToString(React.createElement(ModelPricing, { modelId: "test" }));
  assert.match(html, /Current LLM7 pricing/);
  assert.match(html, /Checking current pricing/);
  assert.match(html, /https:\/\/api.llm7.io\/v1\/models/);
  assert.doesNotMatch(html, /\$\d/);
});

test("price and calculator update together without rebuilding or resetting entered quantities", async t => {
  const f = await mount(t, React.createElement(React.Fragment, {}, React.createElement(ModelPricing, { modelId: "test" }), React.createElement(LivePrice, { modelId: "test" })));
  assert.equal(f.calls, 1);
  assert.match(document.body.textContent, /\$3.00 USD input and \$15.00 USD output/);
  assert.match(document.body.textContent, /\$0.0675/);
  await act(async () => document.querySelector('[aria-label="Increase Input tokens"]').click());
  assert.match(document.body.textContent, /\$0.067503/);
  await f.refresh([apiModel("test", 6, 30)]);
  assert.match(document.body.textContent, /\$6.00 USD input and \$30.00 USD output/);
  assert.match(document.body.textContent, /\$0.135006/);
  assert.doesNotMatch(document.body.textContent, /\$3.00 USD/);
  await f.refresh(new Error("offline"));
  assert.match(document.body.textContent, /could not be verified/);
  assert.doesNotMatch(document.body.textContent, /\$6.00|Estimated total/);
  await f.refresh([apiModel("test", 0, 0)]);
  assert.match(document.body.textContent, /\$0.00 USD input/);
  assert.match(document.body.textContent, /Estimated total\$0/);
});

test("comparisons share the request and invalidate unsupported or removed rates", async t => {
  const f = await mount(t, React.createElement(LiveComparisonPricing, { leftId: "left", rightId: "right" }), [apiModel("left"), apiModel("right", 2, 10)]);
  assert.equal(f.calls, 1);
  assert.equal(document.querySelectorAll("[data-live-price]").length, 2);
  await f.refresh([apiModel("left", 1, 5)]);
  assert.equal(document.querySelectorAll("[data-live-price]").length, 1);
  assert.match(document.body.textContent, /No current price is published/);
  assert.doesNotMatch(document.body.textContent, /\$2.00 USD|same billing mode/);
});

test("scenario estimates follow live rates and pause on a failed refresh", async t => {
  const model = metadata("test");
  const f = await mount(t, React.createElement(Explorer, { page: { family: "calculators", slug: "support", title: "Support", description: "", path: "/cost-calculator/support/", models: [model], indexable: true } }), [apiModel(model.model_id)]);
  const cost = () => document.querySelector("tbody tr td:nth-child(5)").textContent;
  assert.equal(cost(), "$135");
  await f.refresh([apiModel(model.model_id, 6, 30)]);
  assert.equal(cost(), "$270");
  await f.refresh(new Error("offline"));
  assert.equal(cost(), "Unknown price");
  assert.doesNotMatch(document.querySelector("tbody").textContent, /\$270|\$135/);
});

test("returning to an expired tab refreshes prices once for all mounted consumers", async t => {
  let now = 0;
  const f = await mount(t, React.createElement(LivePrice, { modelId: "test" }), [apiModel("test")], { now: () => now });
  f.setResponse([apiModel("test", 9, 45)]);
  await act(async () => { window.dispatchEvent(new window.Event("focus")); await liveModelsStore.refresh(); });
  assert.equal(f.calls, 1, "a fresh cache avoids a redundant focus request");
  now = 180_001;
  await act(async () => { window.dispatchEvent(new window.Event("focus")); window.dispatchEvent(new window.Event("pageshow")); await liveModelsStore.refresh(); });
  assert.equal(f.calls, 2);
  assert.match(document.body.textContent, /\$9.00 USD input/);
});

test("catalogue price order changes with refreshed rates and puts missing prices last", async t => {
  const cards = ["a", "b"].map(id => React.createElement("article", { key: id, "data-model-card": true, "data-model-id": id, "data-name": id }, id));
  const f = await mount(t, React.createElement(React.Fragment, {}, React.createElement(CatalogueControls, { tiers: [] }), React.createElement("div", { "data-model-list": true }, cards)), [apiModel("a", 3), apiModel("b", 2)]);
  const order = () => [...document.querySelectorAll("[data-model-card]")].map(card => card.dataset.modelId);
  await act(async () => {
    const select = [...document.querySelectorAll("select")].at(-1);
    select.value = "price";
    select.dispatchEvent(new window.Event("change", { bubbles: true }));
  });
  assert.deepEqual(order(), ["b", "a"]);
  await f.refresh([apiModel("a", 1), apiModel("b", 2)]);
  assert.deepEqual(order(), ["a", "b"]);
  await f.refresh([apiModel("b", 2)]);
  assert.deepEqual(order(), ["b", "a"]);
});

test("the token budget calculator uses updated API rates and omits unavailable models", async t => {
  const model = metadata("test");
  const f = await mount(t, React.createElement(TokenBudget, { models: [model] }), [apiModel(model.model_id)]);
  const tokens = () => Number(document.querySelector("tbody tr td:nth-child(2)").textContent.replaceAll(",", ""));
  const blendedPrice = () => Number(document.querySelector("tbody tr td:nth-child(7)").textContent.match(/[\d.]+/)[0]);
  const beforeTokens = tokens(), beforePrice = blendedPrice();
  assert.ok(beforeTokens > 0);
  await f.refresh([apiModel(model.model_id, 6, 30)]);
  assert.ok(Math.abs(tokens() * 2 - beforeTokens) <= 1, "doubling rates halves the tokens bought with the same budget");
  assert.ok(Math.abs(blendedPrice() - beforePrice * 2) < 0.0002);
  assert.equal(document.querySelector("#usd-budget").value, "10");
  await f.refresh(new Error("offline"));
  assert.match(document.body.textContent, /could not be verified/);
  assert.equal(document.querySelectorAll("tbody tr").length, 0);
});
