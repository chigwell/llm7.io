import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { loadTypeScript } from "./support/load-typescript.mjs";
import { createAnalytics } from "../lib/analytics-core.js";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime.js";

const api = loadTypeScript("lib/analytics.ts");
const { trackLandingLink } = loadTypeScript("lib/analytics-links.ts");
const { useChatGeneration } = loadTypeScript("hooks/use-chat-generation.ts");
const chat = loadTypeScript("lib/chat/request.ts");
const Lifecycle = loadTypeScript("components/AnalyticsLifecycle.tsx").default;
const Consent = loadTypeScript("components/AnalyticsConsent.jsx").default;
const Preferences = loadTypeScript("components/AnalyticsConsent.jsx").AnalyticsPreferences;

function dom(t) {
  const dom = new JSDOM('<div id="root"></div>', { url: "https://llm7.io/" });
  const restore = [];
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, Element: dom.window.Element,
    IS_REACT_ACT_ENVIRONMENT: true })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    restore.push(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const root = createRoot(dom.window.document.getElementById("root"));
  t.after(async () => {
    try { await act(async () => root.unmount()); } finally {
      dom.window.close();
      restore.forEach(reset => reset());
    }
  });
  return root;
}

test("landing root consent and navigation cover non-home pages without query data", async t => {
  const root = dom(t), captured = [];
  const load = t.mock.fn(() => ({ init: (_, config) => config.loaded({
    capture: (event, properties) => captured.push({ event, properties }),
    opt_in_capturing() {}, opt_out_capturing() {},
  }) }));
  Object.assign(api.analytics, createAnalytics({ token: "phc_test", host: "https://eu.i.posthog.com", surface: "landing", loadSdk: load }));
  t.mock.method(api, "track", api.analytics.track);
  const tree = path => React.createElement(React.StrictMode, {}, React.createElement(Consent),
    React.createElement(PathnameContext.Provider, { value: path }, React.createElement(Lifecycle)),
    React.createElement("footer", {}, React.createElement(Preferences)));
  window.history.replaceState({}, "", "/models/?r=private-ref");
  await act(async () => root.render(tree("/models/")));
  assert.ok(!document.body.textContent.includes("We do not collect prompts, responses, passwords or API keys."));
  assert.equal(load.mock.callCount(), 0);
  const button = label => [...document.querySelectorAll("button")].find(el => el.textContent === label);
  await act(async () => button("No thanks").click());
  assert.equal(load.mock.callCount(), 0);
  assert.equal(document.querySelector(".llm7-analytics-banner"), null);
  assert.equal(document.querySelector(".llm7-analytics-preferences"), null);
  assert.ok(button("Analytics preferences").closest("footer"));
  await act(async () => button("Analytics preferences").click());
  await act(async () => document.querySelector('input[type="checkbox"]').click());
  await act(async () => button("Save preferences").click());
  assert.equal(load.mock.callCount(), 1);
  assert.equal(document.querySelector(".llm7-analytics-banner"), null);
  assert.deepEqual(captured, [{ event: "$pageview", properties: { surface: "landing", consent_version: 1, route: "/models/" } }]);
  window.history.pushState({}, "", "/integrations/n8n/?key=private");
  await act(async () => root.render(tree("/integrations/n8n/")));
  assert.equal(captured.at(-1).properties.route, "/integrations/n8n/");
  assert.equal(captured.length, 2);
  const link = document.createElement("a");
  link.href = "https://dash.llm7.io/?r=private";
  link.dataset.analyticsPlacement = "hero";
  document.body.append(link);
  // Exercise delegated root listener while preventing actual external navigation.
  link.addEventListener("click", e => e.preventDefault());
  await act(async () => link.click());
  assert.deepEqual(captured.at(-1), { event: "cta_clicked", properties: { target: "dashboard", placement: "hero", surface: "landing", consent_version: 1, route: "/integrations/n8n/" } });
});

test("only curated landing CTAs emit, without href or link text", t => {
  dom(t);
  const events = [];
  t.mock.method(api, "track", (event, props) => events.push([event, props]));
  const a = document.createElement("a");
  a.href = "https://dash.llm7.io/?token=secret"; a.textContent = "private input";
  trackLandingLink(a, window.location.href);
  assert.deepEqual(events, [["cta_clicked", { target: "dashboard", placement: "content" }]]);
  a.href = "https://unrelated.example/";
  trackLandingLink(a, window.location.href);
  assert.equal(events.length, 1);
});

test("demo success and failure emit model/outcome/buckets, never input, output, token or error", async t => {
  const root = dom(t), events = [];
  t.mock.method(api, "track", (event, props) => { events.push([event, props]); return new Promise(() => {}); });
  const request = t.mock.method(chat, "requestChat", async () => "private-output");
  t.mock.method(console, "error", () => {});
  let hook;
  function Demo() {
    hook = useChatGeneration({ text: "private-input", model: "fast", apiToken: "private-key", getCookie: () => "", fetchApiToken: async () => null });
    return null;
  }
  await act(async () => root.render(React.createElement(Demo)));
  await act(async () => hook.handleSubmit({ preventDefault() {} }));
  assert.equal(hook.status, "ready");
  assert.equal(hook.response, "private-output");
  assert.deepEqual(events, [
    ["demo_submitted", { model: "fast" }],
    ["demo_result", { model: "fast", outcome: "success", latency_bucket: "under_1s" }],
  ]);
  request.mock.mockImplementation(async () => { throw new Error("private-error"); });
  await act(async () => hook.handleSubmit({ preventDefault() {} }));
  assert.equal(hook.status, "error");
  assert.deepEqual(events.at(-1), ["demo_result", { model: "fast", outcome: "failure", latency_bucket: "under_1s" }]);
});
