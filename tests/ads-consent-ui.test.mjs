import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { createAnalytics } from "../lib/analytics-core.js";
import { createAdsAttribution } from "../lib/ads-attribution-core.js";
import { loadTypeScript } from "./support/load-typescript.mjs";

const Consent = loadTypeScript("components/AnalyticsConsent.jsx").default;
const { AnalyticsPreferences } = loadTypeScript("components/AnalyticsConsent.jsx");
const { analytics } = loadTypeScript("lib/analytics.ts");
const { adsAttribution } = loadTypeScript("lib/ads-attribution.js");

async function mount(t, { token = "", priorProduct = false } = {}) {
  const dom = new JSDOM('<div id="root"></div>', { url: "https://llm7.io/?gclid=consented-click" });
  const restores = [];
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })) {
    const before = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    restores.push(() => before ? Object.defineProperty(globalThis, key, before) : delete globalThis[key]);
  }
  const root = createRoot(document.getElementById("root"));
  t.after(async () => { try { await act(async () => root.unmount()); } finally { dom.window.close(); restores.forEach(fn => fn()); } });
  const imports = t.mock.fn(() => ({ init: (_, config) => config.loaded({ capture() {}, opt_in_capturing() {}, opt_out_capturing() {} }) }));
  Object.assign(analytics, createAnalytics({ token, host: "https://eu.i.posthog.com", surface: "landing", loadSdk: imports }));
  Object.assign(adsAttribution, createAdsAttribution());
  if (priorProduct) analytics.setConsent(true);
  await act(async () => root.render(React.createElement(React.StrictMode, {},
    React.createElement(Consent), React.createElement("footer", {}, React.createElement(AnalyticsPreferences)))));
  const button = name => [...document.querySelectorAll("button")].find(node => node.textContent === name);
  const choice = name => [...document.querySelectorAll("label")].find(node => node.textContent.startsWith(name))?.querySelector("input");
  return { button, choice, imports };
}

test("Ads preferences default to selected but require saving and preserve draft edits", async t => {
  const f = await mount(t);
  assert.ok(f.button("Analytics preferences"));
  assert.equal(f.choice("Product analytics"), undefined);
  assert.equal(f.choice("Google & OpenAI ad measurement").checked, true);
  assert.equal(adsAttribution.getAttribution(), null);
  await act(async () => f.choice("Google & OpenAI ad measurement").click());
  await act(async () => window.dispatchEvent(new window.Event("focus")));
  assert.equal(f.choice("Google & OpenAI ad measurement").checked, false, "focus does not discard an unsaved choice");
  await act(async () => f.choice("Google & OpenAI ad measurement").click());
  assert.equal(adsAttribution.getConsent(), "unknown", "checking alone does not save consent");
  await act(async () => f.button("Save preferences").click());
  assert.equal(adsAttribution.getConsent(), "allowed");
  assert.equal(adsAttribution.getAttribution().click_id, "consented-click");
  assert.equal(f.imports.mock.callCount(), 0);
  assert.equal(document.querySelector("aside"), null);
  await act(async () => f.button("Analytics preferences").click());
  assert.equal(f.choice("Google & OpenAI ad measurement").checked, true);
  await act(async () => f.button("No thanks").click());
  assert.equal(adsAttribution.getAttribution(), null);
  assert.equal(adsAttribution.getConsent(), "declined");
});

test("existing PostHog permission prompts for Ads without silently opting in", async t => {
  const f = await mount(t, { token: "phc_test", priorProduct: true });
  assert.equal(f.choice("Product analytics").checked, true);
  assert.equal(f.choice("Google & OpenAI ad measurement").checked, true);
  assert.equal(adsAttribution.getConsent(), "unknown");
  await act(async () => f.choice("Google & OpenAI ad measurement").click());
  await act(async () => f.button("Save preferences").click());
  assert.equal(analytics.getConsent(), "allowed");
  assert.equal(adsAttribution.getConsent(), "declined");
  assert.equal(adsAttribution.getAttribution(), null);
});
