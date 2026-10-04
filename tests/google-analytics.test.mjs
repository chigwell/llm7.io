import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime.js";
import { createAnalytics } from "../lib/analytics-core.js";
import { loadTypeScript } from "./support/load-typescript.mjs";

const GoogleAnalytics = loadTypeScript("components/GoogleAnalytics.tsx").default;
const Lifecycle = loadTypeScript("components/AnalyticsLifecycle.tsx").default;
const Consent = loadTypeScript("components/AnalyticsConsent.jsx").default;
const { AnalyticsPreferences } = loadTypeScript("components/AnalyticsConsent.jsx");
const { analytics } = loadTypeScript("lib/analytics.ts");

test("GA runs without consent and after decline/withdrawal; PostHog remains opt-in", async t => {
  // Execute the local inline initializer only. Remote scripts are never fetched.
  const dom = new JSDOM('<div id="root"></div>', {
    url: "https://llm7.io/?token=private",
    runScripts: "dangerously",
  });
  const restore = [];
  for (const [key, value] of Object.entries({
    window: dom.window, document: dom.window.document, Element: dom.window.Element,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    restore.push(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const root = createRoot(document.getElementById("root"));
  t.after(async () => {
    try { await act(async () => root.unmount()); } finally {
      dom.window.close();
      restore.forEach(reset => reset());
    }
  });
  const captured = [];
  const loadSdk = t.mock.fn(() => ({ init: (_, config) => config.loaded({
    capture: (event, properties) => captured.push({ event, properties }),
    opt_in_capturing() {}, opt_out_capturing() {},
  }) }));
  Object.assign(analytics, createAnalytics({ token: "phc_test", host: "https://eu.i.posthog.com", surface: "landing", loadSdk }));
  const tree = (path, key = "initial") => React.createElement(React.StrictMode, {},
    React.createElement(PathnameContext.Provider, { value: path },
      React.createElement(GoogleAnalytics, { key }), React.createElement(Lifecycle)),
    React.createElement(Consent),
    React.createElement("footer", {}, React.createElement(AnalyticsPreferences)));
  const views = () => [...window.dataLayer].map(args => Array.from(args))
    .filter(args => args[0] === "event" && args[1] === "page_view");
  const button = label => [...document.querySelectorAll("button")].find(el => el.textContent === label);
  const renderRoute = async (path, key) => {
    window.history.replaceState({}, "", path + "?token=private");
    await act(async () => root.render(tree(path, key)));
  };

  await renderRoute("/");
  assert.equal(analytics.getConsent(), "unknown");
  assert.equal(loadSdk.mock.callCount(), 0);
  assert.equal(document.querySelectorAll('script[src^="https://www.googletagmanager.com/gtag/js"]').length, 1);
  assert.ok(document.body.textContent.includes("This choice controls PostHog only"));
  assert.deepEqual(views(), [["event", "page_view", {
    page_path: "/", page_location: "https://llm7.io/", page_referrer: "",
  }]]);
  const config = [...window.dataLayer].map(args => Array.from(args)).find(args => args[0] === "config");
  assert.equal(config[2].send_page_view, false);

  await act(async () => button("No thanks").click());
  assert.equal(analytics.getConsent(), "declined");
  assert.equal(loadSdk.mock.callCount(), 0);
  assert.equal(views().length, 1, "consent changes do not duplicate GA pageviews");
  await renderRoute("/models/");
  assert.equal(views().length, 2);
  assert.equal(views().at(-1)[2].page_path, "/models/");
  assert.equal(captured.length, 0);
  // Returning to the homepage with an existing refusal still tracks a visit.
  await renderRoute("/", "return-with-declined-consent");
  assert.equal(views().length, 3);
  assert.equal(loadSdk.mock.callCount(), 0);

  await act(async () => button("Analytics preferences").click());
  await act(async () => button("Allow analytics").click());
  assert.equal(loadSdk.mock.callCount(), 1);
  assert.equal(captured.length, 1);
  assert.equal(views().length, 3);
  await act(async () => button("Analytics preferences").click());
  await act(async () => button("No thanks").click());
  await renderRoute("/models/", "return-with-declined-consent");
  assert.equal(views().length, 4);
  assert.equal(captured.length, 1, "withdrawal still stops PostHog");
  assert.equal(window["ga-disable-" + config[1]], undefined);
  assert.ok(!JSON.stringify(views()).includes("private"));
  assert.ok(!JSON.stringify(views()).includes("token="));
});
