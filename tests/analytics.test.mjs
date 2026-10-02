import test from "node:test";
import assert from "node:assert/strict";
import { createAnalytics, sanitizeRoute, latencyBucket, amountBucket } from "../lib/analytics-core.js";

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function fixture({ surface = "dashboard", jar = {}, loadSdk, hostname = "dash.llm7.io", token = "phc_test" } = {}) {
  const cookies = [];
  const win = { location: { hostname, protocol: "https:", hash: "#/billing?token=secret", pathname: "/" }, document: {} };
  Object.defineProperty(win.document, "cookie", {
    get: () => jar.value || "",
    set: value => { cookies.push(value); jar.value = value.split(";")[0]; },
  });
  const sent = [], identified = [], reset = [], dispatches = [];
  let config, imports = 0, inits = 0;
  const client = {
    capture: (event, properties) => sent.push(config.before_send({ event, properties: {
      ...properties, $current_url: "https://unsafe/?token=secret", $referrer: "secret", $set_once: { email: "secret" },
    } })),
    identify: (...args) => identified.push(args),
    reset: (...args) => reset.push(args),
    opt_in_capturing: () => {},
    opt_out_capturing: () => {},
    _requestQueue: { _queue: [] },
    _retryQueue: { _queue: [], retriableRequest: () => dispatches.push("retry"), _enqueue: () => dispatches.push("enqueue"), unload: () => dispatches.push("unload") },
    _send_request: () => dispatches.push("send"),
    _send_retriable_request: () => dispatches.push("batch"),
  };
  const module = { init: (_, options) => { config = options; inits++; options.loaded(client); } };
  const analytics = createAnalytics({ token, host: "https://eu.i.posthog.com", surface, browser: () => win,
    loadSdk: () => { imports++; return loadSdk ? loadSdk(module) : module; },
  });
  return { analytics, win, cookies, sent, identified, reset, client, dispatches,
    config: () => config, counts: () => [imports, inits] };
}
test("unknown and declined consent never imports SDK, buffers events, or identifies", async () => {
  const f = fixture();
  f.analytics.track("api_key_created");
  f.analytics.identify(42, 2);
  f.analytics.trackPageView();
  await tick();
  assert.deepEqual(f.counts(), [0, 0]);
  f.analytics.setConsent(false);
  f.analytics.start();
  f.analytics.track("api_key_created");
  await tick();
  assert.deepEqual(f.counts(), [0, 0]);
  f.analytics.setConsent(true);
  f.analytics.trackPageView();
  await tick();
  assert.deepEqual(f.sent.map(e => e.event), ["$pageview"]);
  assert.deepEqual(f.identified, []);
});
test("shared consent lasts 180 days, is secure, and local development stays host-only", () => {
  const jar = {}, landing = fixture({ surface: "landing", hostname: "llm7.io", jar }), dash = fixture({ jar });
  landing.analytics.setConsent(true);
  assert.equal(dash.analytics.getConsent(), "allowed");
  assert.match(landing.cookies[0], /Max-Age=15552000; SameSite=Lax; Domain=llm7.io; Secure/);
  dash.analytics.setConsent(false);
  assert.equal(landing.analytics.getConsent(), "declined");
  const local = fixture({ hostname: "localhost" });
  local.analytics.setConsent(true);
  assert.ok(!local.cookies[0].includes("Domain="));
});
test("lazy initialization runs once and flushes at most 50 queued entries without waiting", async () => {
  let resolve;
  const f = fixture({ loadSdk: sdk => new Promise(done => { resolve = () => done(sdk); }) });
  f.analytics.setConsent(true);
  f.analytics.identify(42, 2);
  for (let n = 0; n < 70; n++) assert.equal(f.analytics.track("api_key_created", { email: "secret" }), undefined);
  await tick();
  assert.deepEqual(f.counts(), [1, 0]);
  resolve(); await tick();
  assert.deepEqual(f.counts(), [1, 1]);
  assert.equal(f.sent.length, 49);
  assert.deepEqual(f.identified, [["42", { plan: "2" }]]);
  f.analytics.track("api_key_renamed");
  await tick();
  assert.deepEqual(f.counts(), [1, 1]);
});
test("withdrawal while import is pending discards events without initializing", async () => {
  let resolve;
  const f = fixture({ loadSdk: sdk => new Promise(done => { resolve = () => done(sdk); }) });
  f.analytics.setConsent(true);
  f.analytics.trackPageView(); await tick();
  f.analytics.setConsent(false);
  resolve(); await tick();
  assert.deepEqual(f.counts(), [1, 0]);
  assert.deepEqual(f.sent, []);
});
test("SDK import, capture, identity and reset failures never escape to business callers", async () => {
  const broken = fixture({ loadSdk: () => Promise.reject(new Error("blocked")) });
  broken.analytics.setConsent(true);
  broken.analytics.trackPageView(); await tick();
  broken.analytics.track("api_key_created"); await tick();
  assert.deepEqual(broken.counts(), [1, 0]);
  const f = fixture();
  f.analytics.setConsent(true); f.analytics.start(); await tick();
  f.client.capture = () => { throw new Error("offline"); };
  f.client.identify = () => Promise.reject(new Error("offline"));
  f.client.reset = () => { throw new Error("offline"); };
  assert.doesNotThrow(() => {
    f.analytics.track("api_key_created"); f.analytics.identify(42, 2); f.analytics.reset();
  });
  await tick();
});
test("final payload allowlist excludes inputs, all raw URLs, automatic person data, and unknown events", async () => {
  const f = fixture();
  f.analytics.setConsent(true);
  f.analytics.track("playground_result", { model: "gpt-4o", outcome: "success", latency_bucket: "1_5s",
    prompt: "secret", response: "secret", api_key: "secret", email: "secret", balance: 123, payment_id: "secret" });
  await tick();
  assert.deepEqual(f.sent[0].properties, {
    model: "gpt-4o", outcome: "success", latency_bucket: "1_5s", surface: "dashboard", consent_version: 1,
    route: "/#/billing", $current_url: "https://dash.llm7.io/#/billing", $pathname: "/",
  });
  const beforeSend = f.config().before_send;
  assert.equal(beforeSend({ event: "$autocapture", properties: {} }), null);
  assert.deepEqual(beforeSend({ event: "$identify", properties: { distinct_id: "42", $anon_distinct_id: "anon", $set: { plan: "2", email: "secret" } } }).properties.$set, { plan: "2" });
  assert.deepEqual(beforeSend({ event: "$set", properties: { $set: { plan: "3", password: "secret" } } }).properties.$set, { plan: "3" });
  const envelope = beforeSend({ event: "$identify", properties: {}, $set: { plan: "2", email: "secret" }, $set_once: { password: "secret" } });
  assert.deepEqual(envelope.$set, { plan: "2" });
  assert.equal(envelope.$set_once, undefined);
});
test("manual routes exclude auth hashes, query strings and deduplicate repeated views", async () => {
  const f = fixture();
  f.analytics.setConsent(true); f.analytics.trackPageView(); f.analytics.trackPageView();
  f.win.location.hash = "#/playground?api_key=secret"; f.analytics.trackPageView();
  f.win.location.hash = "#token=secret"; f.analytics.trackPageView();
  await tick();
  assert.deepEqual(f.sent.map(e => e.properties.route), ["/#/billing", "/#/playground", "/#/"]);
  assert.equal(sanitizeRoute("landing", { pathname: "/models/gpt-4o", search: "?ref=secret" }), "/models/gpt-4o");
  assert.equal(sanitizeRoute("landing", { pathname: "/secret@example.com" }), "/other");
});
test("dashboard identity is opaque, deduplicated, tier-only, and reset before account switch", async () => {
  const f = fixture();
  f.analytics.setConsent(true); f.analytics.start(); await tick();
  f.analytics.identify("person@example.com", 2);
  f.analytics.identify(42, 2); f.analytics.identify(42, 2); f.analytics.identify(42, 3);
  f.analytics.identify(99, 0);
  assert.deepEqual(f.identified, [["42", { plan: "2" }], ["42", { plan: "3" }], ["99", { plan: "0" }]]);
  assert.deepEqual(f.reset, [[true]]);
  f.analytics.reset();
  assert.equal(f.reset.length, 2);
  const landing = fixture({ surface: "landing" });
  landing.analytics.setConsent(true); landing.analytics.identify(42, 2);
  await tick();
  assert.deepEqual(landing.counts(), [0, 0]);
});
test("opt-out removes pending batches/retries and denies dispatch even before cross-tab sync", async () => {
  const f = fixture();
  f.analytics.setConsent(true); f.analytics.start(); await tick();
  f.client._send_request(); assert.equal(f.dispatches.length, 1);
  f.win.document.cookie = "llm7_analytics_consent=v1_declined";
  f.client._send_request(); f.client._send_retriable_request();
  f.client._retryQueue.retriableRequest(); f.client._retryQueue._enqueue(); f.client._retryQueue.unload();
  assert.equal(f.dispatches.length, 1);
  f.client._requestQueue._queue.push("pending");
  f.client._retryQueue._queue.push("pending");
  f.analytics.syncConsent();
  assert.deepEqual(f.client._requestQueue._queue, []);
  assert.deepEqual(f.client._retryQueue._queue, []);
  assert.equal(f.config().before_send({ event: "$pageview" }), null);
});
test("SDK config disables automatic collection and missing env disables analytics", async () => {
  const f = fixture();
  f.analytics.setConsent(true); f.analytics.start(); await tick();
  for (const name of ["autocapture", "capture_pageview", "capture_pageleave", "capture_performance", "capture_exceptions"]) assert.equal(f.config()[name], false);
  assert.equal(f.config().disable_session_recording, true);
  assert.equal(f.config().cross_subdomain_cookie, true);
  assert.equal(f.config().person_profiles, "identified_only");
  const disabled = fixture({ token: "" });
  disabled.analytics.setConsent(true); disabled.analytics.trackPageView(); await tick();
  assert.deepEqual(disabled.counts(), [0, 0]);
});
test("bucket boundaries are deterministic and exclude exact amounts and duration", () => {
  assert.deepEqual([0, 999, 1000, 4999, 5000, 30000].map(latencyBucket), ["under_1s","under_1s","1_5s","1_5s","5_30s","over_30s"]);
  assert.deepEqual([1000, 2500, 5000, 10000, 25000].map(amountBucket), ["10_24","25_49","50_99","100_249","250_500"]);
});
