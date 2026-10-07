import test from "node:test";
import assert from "node:assert/strict";
import { createAdsAttribution } from "../lib/ads-attribution-core.js";

const UUID1 = "8b9c34bd-2c3c-4bba-a3d4-0636f3957657";
const UUID2 = "da033322-e3ec-410b-9d6d-b991d9c196a2";
const DAY = 86400000;
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function fixture({ jar = new Map(), hostname = "llm7.io", protocol = "https:", search = "?gclid=test-click_123&email=secret", fetch, uuid = UUID1, revocationTimeoutMs } = {}) {
  let clock = Date.parse("2026-10-07T10:00:00.000Z");
  const writes = [], requests = [], handlers = new Map(), timers = new Map();
  const win = { location: { hostname, protocol, search }, crypto: { randomUUID: () => uuid }, document: {},
    addEventListener: (type, fn) => handlers.set(type, fn), removeEventListener: type => handlers.delete(type),
    setInterval: fn => { timers.set(timers.size + 1, fn); return timers.size; }, clearInterval: id => timers.delete(id),
    fetch: async (url, options) => { requests.push({ url, options }); return fetch ? fetch(url, options) : { status: 204 }; },
  };
  Object.defineProperty(win.document, "cookie", {
    configurable: true,
    get: () => [...jar].map(([key, value]) => `${key}=${value}`).join("; "),
    set: line => {
      writes.push(line);
      const [pair] = line.split(";"), index = pair.indexOf("="), key = pair.slice(0, index), value = pair.slice(index + 1);
      if (line.includes("Max-Age=0;")) jar.delete(key); else jar.set(key, value);
    },
  });
  const api = createAdsAttribution({ browser: () => win, now: () => clock, revocationTimeoutMs });
  return { api, win, jar, writes, requests, handlers, timers,
    advance: ms => { clock += ms; }, data: key => JSON.parse(decodeURIComponent(jar.get(key))),
    put: (key, value) => jar.set(key, encodeURIComponent(JSON.stringify(value))),
  };
}

test("before explicit Ads opt-in there is no click storage or network; PostHog consent does not authorize Ads", async () => {
  const f = fixture();
  f.jar.set("llm7_analytics_consent", "v1_allowed");
  const stop = f.api.start();
  assert.equal(f.api.getConsent(), "unknown");
  assert.equal(f.api.getAttribution(), null);
  assert.deepEqual(f.writes, []);
  assert.deepEqual(f.requests, []);
  f.api.setConsent(false);
  await tick();
  assert.equal(f.api.getAttribution(), null);
  assert.equal(f.jar.has("llm7_ads_attribution"), false);
  assert.deepEqual(f.requests, []);
  stop();
});

test("allowed attribution shares an exact six-field allowlist and secure parent-domain cookies", () => {
  const f = fixture();
  f.api.start();
  f.api.setConsent(true);
  assert.deepEqual(f.api.getAttribution(), { version: 1, click_id_type: "gclid", click_id: "test-click_123",
    captured_at: "2026-10-07T10:00:00.000Z", consented_at: "2026-10-07T10:00:00.000Z", consent_id: UUID1 });
  assert.ok(f.writes.find(line => line.startsWith("llm7_ads_consent=")).includes("Max-Age=15552000; SameSite=Lax; Domain=llm7.io; Secure"));
  assert.ok(f.writes.find(line => line.startsWith("llm7_ads_attribution=")).includes("Max-Age=2592000; SameSite=Lax; Domain=llm7.io; Secure"));
  const dashboard = fixture({ jar: f.jar, hostname: "dash.llm7.io", search: "" });
  assert.equal(dashboard.api.getConsent(), "allowed");
  assert.deepEqual(dashboard.api.getAttribution(), f.api.getAttribution());
  assert.deepEqual(f.requests, []);
  assert.ok(!JSON.stringify([...f.jar]).includes("secret"));
  const local = fixture({ hostname: "localhost", protocol: "http:" });
  local.api.setConsent(true);
  assert.ok(local.writes.every(line => !line.includes("Domain=") && !line.includes("Secure")));
});

test("the latest valid click wins, while focus and a return to the same click do not refresh its timestamp", () => {
  const f = fixture(); f.api.setConsent(true);
  const first = f.api.getAttribution();
  f.advance(DAY); f.api.syncConsent();
  assert.equal(f.api.getAttribution().captured_at, first.captured_at);
  const returned = fixture({ jar: f.jar }); returned.advance(DAY);
  assert.equal(returned.api.getAttribution().captured_at, first.captured_at);
  f.win.location.search = "?wbraid=new-click";
  assert.equal(f.api.getAttribution().click_id_type, "wbraid");
  assert.equal(f.api.getAttribution().click_id, "new-click");
  assert.equal(f.api.getAttribution().captured_at, "2026-10-08T10:00:00.000Z");
  // The original tab must not overwrite the newer shared click.
  assert.equal(returned.api.getAttribution().click_id, "new-click");
});

test("old, future, malformed, unconsented and injected attributes cannot reach checkout", () => {
  const f = fixture(); f.api.setConsent(true);
  const valid = f.api.getAttribution();
  for (const update of [ { captured_at: "2026-09-01T10:00:00.000Z" }, { captured_at: "2026-10-07T10:06:00.000Z" },
    { captured_at: "nonsense" }, { click_id: "a b" }, { click_id: 123 }, { click_id: "x".repeat(513) },
    { click_id_type: "email" }, { consent_id: UUID2 }, { consented_at: "2026-10-07T09:00:00.000Z" } ]) {
    const other = fixture({ jar: new Map(f.jar), search: "" });
    other.put("llm7_ads_attribution", { ...valid, ...update });
    assert.equal(other.api.getAttribution(), null, JSON.stringify(update));
  }
  const clean = fixture({ jar: new Map(f.jar), search: "" });
  clean.put("llm7_ads_attribution", { ...valid, email: "secret", account_id: 42 });
  assert.deepEqual(clean.api.getAttribution(), valid);
  f.advance(30 * DAY + 1);
  assert.equal(f.api.getAttribution(), null);
});

test("invalid and duplicate click parameters are ignored without external requests", () => {
  for (const search of ["?gclid=bad%20id", "?gclid=a&gclid=b", "?gclid=" + "x".repeat(513), "?gclid=%E2%98%83", "?email=private"]) {
    const f = fixture({ search }); f.api.setConsent(true);
    assert.equal(f.api.getAttribution(), null, search);
    assert.deepEqual(f.requests, []);
  }
});

test("withdrawal removes click data and sends only the opaque receipt without credentials", async () => {
  const f = fixture(); f.api.setConsent(true); f.api.setConsent(false);
  assert.equal(f.api.getConsent(), "declined");
  assert.equal(f.api.getAttribution(), null);
  assert.equal(f.jar.has("llm7_ads_attribution"), false);
  await tick();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].url, "https://api-token.llm7.io/ads-consent/revoke");
  assert.deepEqual(JSON.parse(f.requests[0].options.body), { consent_id: UUID1 });
  assert.equal(f.requests[0].options.credentials, "omit");
  assert.equal(f.requests[0].options.keepalive, true);
  assert.equal(f.jar.has("llm7_ads_revocations"), false);
  f.api.setConsent(true);
  assert.equal(f.api.getAttribution(), null, "re-opting in does not revive a withdrawn click");
});

test("failed revocation stays durable, backs off, and retries from another subdomain after a tab closes", async () => {
  const f = fixture({ fetch: async () => { throw new Error("offline"); } });
  f.api.setConsent(true); f.api.setConsent(false); await tick();
  assert.deepEqual(f.data("llm7_ads_revocations"), [UUID1]);
  for (let i = 0; i < 5; i++) f.api.syncConsent();
  await tick(); assert.equal(f.requests.length, 1);
  f.advance(30000); f.api.syncConsent(); await tick(); assert.equal(f.requests.length, 2);
  const next = fixture({ jar: f.jar, hostname: "dash.llm7.io", search: "" });
  const stop = next.api.start(); await tick();
  assert.equal(next.requests.length, 1);
  assert.equal(next.jar.has("llm7_ads_revocations"), false);
  stop();
});

test("a non-204 revoke acknowledgement does not drop the pending receipt", async () => {
  const f = fixture({ fetch: async () => ({ status: 200 }) });
  f.api.setConsent(true); f.api.setConsent(false); await tick();
  assert.deepEqual(f.data("llm7_ads_revocations"), [UUID1]);
});

test("cross-subdomain withdrawal is observed before a new checkout, including while an old tab is open", async () => {
  const landing = fixture(); landing.api.setConsent(true);
  const dashboard = fixture({ jar: landing.jar, hostname: "dash.llm7.io", search: "" });
  dashboard.api.start();
  assert.equal(dashboard.api.getAttribution().consent_id, UUID1);
  landing.api.setConsent(false);
  assert.equal(dashboard.api.getAttribution(), null);
  await tick();
});

test("lifecycle handles StrictMode cleanup and malformed storage without leaking timers", () => {
  const f = fixture(); f.jar.set("llm7_ads_consent", "%broken");
  f.jar.set("llm7_ads_attribution", "%broken");
  const stop1 = f.api.start(), stop2 = f.api.start();
  assert.equal(f.timers.size, 1);
  assert.equal(f.api.getConsent(), "unknown");
  stop1(); stop1(); assert.equal(f.timers.size, 1);
  stop2(); assert.equal(f.timers.size, 0); assert.equal(f.handlers.size, 0);
  const stop3 = f.api.start(); assert.equal(f.timers.size, 1); stop3();
});

test("storage failure and unavailable secure randomness fail closed", () => {
  const f = fixture(); f.win.crypto = {};
  f.api.setConsent(true); assert.equal(f.api.getConsent(), "unknown");
  assert.equal(f.api.getAttribution(), null);
  assert.doesNotThrow(() => createAdsAttribution({ browser: () => null }).setConsent(true));
});

test("withdrawal stays denied when cookies reject writes, and retains the receipt for retry in memory", async () => {
  for (const throws of [true, false]) {
    let offline = true;
    const f = fixture({ fetch: async () => { if (offline) throw new Error("offline"); return { status: 204 }; } });
    f.api.setConsent(true);
    const cookie = Object.getOwnPropertyDescriptor(f.win.document, "cookie");
    Object.defineProperty(f.win.document, "cookie", { ...cookie, set: () => { if (throws) throw new Error("storage blocked"); } });
    f.api.setConsent(false);
    assert.equal(f.api.getConsent(), "declined");
    assert.equal(f.api.getAttribution(), null);
    await tick();
    assert.equal(f.requests.length, 1);
    f.win.crypto.randomUUID = () => UUID2;
    f.api.setConsent(true);
    assert.equal(f.api.getConsent(), "declined", "an old grant cannot authorize a failed new grant");
    assert.equal(f.api.getAttribution(), null);
    offline = false; f.advance(30000); f.api.syncConsent(); await tick();
    assert.equal(f.requests.length, 2, "withdrawal retries even if its cookie could not be saved");
    f.advance(30000); f.api.syncConsent(); await tick();
    assert.equal(f.requests.length, 2, "a blocked deletion does not cause repeat acknowledged withdrawals");
    Object.defineProperty(f.win.document, "cookie", cookie);
    f.api.setConsent(true);
    assert.equal(f.api.getConsent(), "allowed");
    assert.equal(f.api.getAttribution(), null, "new grant does not reuse the withdrawn attribution");
  }
});

test("a hung withdrawal is aborted, kept pending, and retried after backoff", async () => {
  const f = fixture({ fetch: () => new Promise(() => {}), revocationTimeoutMs: 5 });
  f.api.setConsent(true); f.api.setConsent(false);
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(f.requests[0].options.signal.aborted, true);
  assert.deepEqual(f.data("llm7_ads_revocations"), [UUID1]);
  f.api.syncConsent(); await tick(); assert.equal(f.requests.length, 1);
  f.advance(30000); f.api.syncConsent();
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(f.requests.length, 2);
});
