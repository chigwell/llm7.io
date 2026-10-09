import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { loadTypeScript } from "./support/load-typescript.mjs";

const Catalogue = loadTypeScript("components/PayAsYouGoModels.tsx").default;
const Hero = loadTypeScript("components/HeroSection.tsx").default;
const { createOpenAiPixel, openAiPixel } = loadTypeScript("lib/openai-pixel.js");
const { createLiveModelsStore, liveModelsStore } = loadTypeScript("lib/models/live-models-store.ts");
const receipt = () => encodeURIComponent(JSON.stringify({
  version: 1, choice: "allowed", consent_id: "93c785b3-c9dd-4a98-9c58-fcc67c8126be", consented_at: new Date().toISOString(),
}));
const models = Array.from({ length: 5 }, (_, index) => ({ id: `model-${index}`, model_type: "chat", pricing_mode: "token", pricing: { input: 1, output: 2, currency: "USD", unit: "1M tokens" } }));

async function mount(t, { allowed = true, data = models } = {}) {
  const dom = new JSDOM('<div id="root"></div>', { url: "https://llm7.io/", pretendToBeVisual: true });
  const restores = [];
  for (const [key, value] of Object.entries({ window: dom.window, self: dom.window, document: dom.window.document, fetch: async () => Response.json({}), IS_REACT_ACT_ENVIRONMENT: true })) {
    const before = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    restores.push(() => before ? Object.defineProperty(globalThis, key, before) : delete globalThis[key]);
  }
  const calls = [];
  window.oaiq = (...args) => calls.push(args);
  if (allowed) document.cookie = `llm7_ads_consent=${receipt()}; Path=/`;
  Object.assign(openAiPixel, createOpenAiPixel());
  Object.assign(liveModelsStore, createLiveModelsStore({ fetcher: async () => Response.json({ data }) }));
  const root = createRoot(document.getElementById("root"));
  const render = async key => act(async () => root.render(React.createElement(React.StrictMode, {}, React.createElement(Catalogue, { key }))));
  t.after(async () => {
    try { await act(async () => root.unmount()); } finally { dom.window.close(); restores.forEach(restore => restore()); }
  });
  await act(async () => { await render("initial"); await liveModelsStore.refresh(); });
  return {
    button: () => document.querySelector("button[aria-controls='payg-model-list']"),
    events: () => calls.filter(([command]) => command === "measure"),
    async click() { await act(async () => this.button().click()); },
    render,
  };
}

test("catalogue expansion emits one real standard event and retains collapse plus funding actions", async t => {
  const f = await mount(t);
  assert.equal(document.querySelectorAll("#payg-model-list article").length, 3);
  assert.equal(f.button().getAttribute("aria-expanded"), "false");
  assert.deepEqual(f.events(), [], "mounting and StrictMode do not count as viewing content");
  await f.click();
  assert.equal(document.querySelectorAll("#payg-model-list article").length, 5);
  assert.equal(f.button().getAttribute("aria-expanded"), "true");
  assert.match(f.button().textContent, /Show less/);
  assert.deepEqual(f.events(), [["measure", "contents_viewed", { type: "contents" }]]);
  assert.equal(document.querySelector("a[href='https://dash.llm7.io/#/billing']").textContent.trim(), "Add credit for paid models");
  assert.match(document.body.textContent, /Top up from \$10/);
  await f.click();
  assert.equal(document.querySelectorAll("#payg-model-list article").length, 3);
  assert.equal(document.querySelector("a[href='https://dash.llm7.io/#/billing']"), null);
  await f.click();
  await f.render("remounted");
  await f.click();
  assert.equal(f.events().length, 1, "collapse, repeat expansion and remount never duplicate the first view");
});

test("catalogue expansion without consent is not replayed after consent or remount", async t => {
  const f = await mount(t, { allowed: false });
  await f.click();
  assert.equal(document.querySelectorAll("#payg-model-list article").length, 5, "measurement never gates viewing models");
  assert.equal(f.events().length, 0);
  document.cookie = `llm7_ads_consent=${receipt()}; Path=/`;
  await f.click();
  await f.click();
  await f.render("remounted");
  await f.click();
  assert.equal(f.events().length, 0);
});

test("a catalogue with at most three models does not offer an artificial expansion", async t => {
  const f = await mount(t, { data: models.slice(0, 3) });
  assert.equal(f.button(), null);
  assert.equal(document.querySelectorAll("#payg-model-list article").length, 3);
  assert.equal(f.events().length, 0);
});

test("hero preserves free access and exposes a separately described paid billing destination", () => {
  const dom = new JSDOM(renderToString(React.createElement(Hero)));
  try {
    const links = [...dom.window.document.querySelectorAll("a")];
    assert.equal(links.find(link => link.textContent.includes("Get a Free API Key")).getAttribute("href"), "https://dash.llm7.io/");
    assert.equal(links.find(link => link.textContent.includes("Access paid models")).getAttribute("href"), "https://dash.llm7.io/#/billing");
    assert.match(dom.window.document.body.textContent, /Paid models: top up from \$10/);
    assert.ok(links.some(link => link.getAttribute("href") === "#example"));
  } finally { dom.window.close(); }
});
