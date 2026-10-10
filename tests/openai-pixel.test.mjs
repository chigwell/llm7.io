import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto, createHash } from "node:crypto";
import { createOpenAiPixel } from "../lib/openai-pixel.js";
const receipt = { version: 1, choice: "allowed", consent_id: "93c785b3-c9dd-4a98-9c58-fcc67c8126be", consented_at: new Date().toISOString() };
const attribution = { version: 1, source: "openai", captured_at: receipt.consented_at };
const hash = value => createHash("sha256").update(value).digest("hex");
function fixture() {
  const calls = [], win = { crypto: webcrypto, document: { cookie: `llm7_ads_consent=${encodeURIComponent(JSON.stringify(receipt))}` }, oaiq: (...args) => calls.push(args) };
  const pixel = createOpenAiPixel(() => win);
  pixel.setAttributionSource(() => attribution);
  return { calls, win, pixel, events: () => calls.filter(([command]) => command === "measure") };
}
test("pixel page views require consent and deduplicate repeated lifecycle calls", async () => {
  const f = fixture();
  await f.pixel.pageViewed("/models/"); await f.pixel.pageViewed("/models/"); await f.pixel.pageViewed("/pricing/"); await f.pixel.pageViewed("/models/");
  assert.equal(f.events().length, 3);
  f.win.document.cookie = "";
  f.pixel.pageViewed("/other/");
  assert.equal(f.events().length, 3);
  assert.deepEqual(f.calls.at(-2), ["consent", false]);
  assert.deepEqual(f.calls.at(-1)[1].user, {});
});
test("hashes normalized known identity and clears it on logout without sending raw PII", async () => {
  const f = fixture();
  await f.pixel.identify("  Test@Example.com  ", " Customer-42 ");
  assert.deepEqual(f.calls.at(-1)[1].user, { email_sha256: hash("test@example.com"), external_id_sha256: hash("Customer-42") });
  assert.ok(!JSON.stringify(f.calls).includes("Test@Example"));
  await f.pixel.identify("", undefined);
  assert.deepEqual(f.calls.at(-1)[1].user, {});
});
test("checkout waits for matching data, sends cents and shares the server event ID", async () => {
  const f = fixture();
  f.pixel.identify("test@example.com", 42);
  await f.pixel.checkoutStarted(2500, "llm7-topup-real");
  assert.deepEqual(f.events(), [["measure", "checkout_started", { type: "contents", amount: 2500, currency: "USD" }, { event_id: "llm7-topup-real" }]]);
  assert.deepEqual(f.pixel.checkoutContext(), { consent_id: receipt.consent_id, consented_at: receipt.consented_at, attribution });
  f.win.document.cookie = "";
  await f.pixel.checkoutStarted(2500, "llm7-topup-next");
  assert.equal(f.events().length, 1);
  assert.equal(f.pixel.checkoutContext(), null);
});
test("revoking consent or switching accounts during hashing discards stale identity", async () => {
  const f = fixture();
  const old = f.pixel.identify("old@example.com", 1);
  await f.pixel.identify("new@example.com", 2);
  await old;
  assert.equal(f.calls.at(-1)[1].user.email_sha256, hash("new@example.com"));
  const pending = f.pixel.identify("third@example.com", 3);
  f.win.document.cookie = ""; f.pixel.syncConsent(); await pending;
  assert.ok(!JSON.stringify(f.calls).includes(hash("third@example.com")));
});
test("storage, crypto and SDK failures never escape into navigation or checkout", async () => {
  const f = fixture();
  f.win.oaiq = () => { throw new Error("blocked"); };
  f.win.crypto = {};
  await f.pixel.identify("test@example.com", 42);
  await f.pixel.checkoutStarted(2500, "llm7-topup-real");
  assert.doesNotThrow(() => f.pixel.pageViewed("/"));
  await createOpenAiPixel(() => null).checkoutStarted(2500, "event");
});

test("an in-memory decline overrides an old allowed cookie when storage writes fail", () => {
  const f = fixture();
  f.pixel.setConsentSource(() => "declined");
  f.pixel.pageViewed("/");
  assert.equal(f.events().length, 0);
  assert.equal(f.pixel.checkoutContext(), null);
});

test("catalogue expansion is measured once per page lifetime and custom names match Ads configuration", async () => {
  const f = fixture();
  await f.pixel.contentsViewed();
  await f.pixel.contentsViewed();
  await f.pixel.addBalanceClicked();
  await f.pixel.paymentProviderChosen("stripe");
  await f.pixel.paymentProviderChosen("oxapay");
  await f.pixel.paymentProviderChosen("unsupported");
  assert.deepEqual(f.events(), [
    ["measure", "contents_viewed", { type: "contents" }],
    ["measure", "custom", { type: "custom" }, { custom_event_name: "addbalanceclick" }],
    ["measure", "custom", { type: "custom" }, { custom_event_name: "choosestripe" }],
    ["measure", "custom", { type: "custom" }, { custom_event_name: "chooseoxapya" }],
  ]);
});

test("actions without consent are never replayed after consent is granted", async () => {
  const f = fixture();
  f.win.document.cookie = "";
  const tasks = [f.pixel.contentsViewed(), f.pixel.addBalanceClicked(), f.pixel.paymentProviderChosen("stripe"), f.pixel.checkoutStarted(2500, "checkout")];
  f.win.document.cookie = `llm7_ads_consent=${encodeURIComponent(JSON.stringify(receipt))}`;
  await Promise.all(tasks);
  await f.pixel.contentsViewed();
  assert.equal(f.events().length, 0);
  await f.pixel.addBalanceClicked();
  assert.equal(f.events().length, 1);
});

test("pending actions cannot inherit a different account while matching data is prepared", async () => {
  const f = fixture();
  let release;
  f.win.crypto = { subtle: { digest: () => new Promise(resolve => { release = resolve; }) } };
  const identified = f.pixel.identify("old@example.com");
  const action = f.pixel.addBalanceClicked();
  await f.pixel.identify("", undefined);
  release(new Uint8Array(32));
  await Promise.all([identified, action]);
  assert.equal(f.events().length, 0);
});

test("revocation or a new consent receipt suppresses pending actions", async () => {
  for (const nextCookie of ["", `llm7_ads_consent=${encodeURIComponent(JSON.stringify({ ...receipt, consent_id: "new-receipt" }))}`]) {
    const f = fixture();
    let release;
    f.win.crypto = { subtle: { digest: () => new Promise(resolve => { release = resolve; }) } };
    const identified = f.pixel.identify("test@example.com");
    const action = f.pixel.paymentProviderChosen("stripe");
    f.win.document.cookie = nextCookie;
    release(new Uint8Array(32));
    await Promise.all([identified, action]);
    assert.equal(f.events().length, 0);
  }
});

test("original eligibility reference is used and SDK browser cookie encoding is decoded once", () => {
  const f = fixture();
  f.pixel.setAttributionSource(() => ({ ...attribution, oppref: "opaque+click=" }));
  f.win.document.cookie += "; __oppref=stale; __obref=opaque%2Fbrowser%25";
  assert.deepEqual(f.pixel.checkoutContext(), {
    consent_id: receipt.consent_id, consented_at: receipt.consented_at,
    attribution, oppref: "opaque+click=", obref: "opaque/browser%",
  });
});

test("consent and legacy SDK cookies without OpenAI eligibility never initialize or measure", async () => {
  const f = fixture();
  f.pixel.setAttributionSource(() => null);
  f.win.document.cookie += "; __oppref=old-click; __obref=old-browser";
  await f.pixel.identify("person@example.com", 1);
  await f.pixel.pageViewed("/");
  await f.pixel.addBalanceClicked();
  assert.equal(f.pixel.checkoutContext(), null);
  assert.deepEqual(f.calls, []);
});

test("expired eligibility and a replacement cohort discard pending actions", async () => {
  for (const replacement of [null, { ...attribution, captured_at: new Date(Date.now() - 30 * 86400000).toISOString() }, { ...attribution, oppref: "new-click" }]) {
    const f = fixture();
    let release;
    f.win.crypto = { subtle: { digest: () => new Promise(resolve => { release = resolve; }) } };
    const identity = f.pixel.identify("person@example.com");
    const action = f.pixel.addBalanceClicked();
    f.pixel.setAttributionSource(() => replacement);
    release(new Uint8Array(32));
    await Promise.all([identity, action]);
    assert.equal(f.events().length, 0);
  }
});

function loadingFixture() {
  const f = fixture(), scripts = [];
  delete f.win.oaiq;
  f.win.location = new URL("https://dash.llm7.io/?utm_source=openai&click_id=opaque%2Bvalue%3D#/billing");
  f.win.history = { state: { retained: true }, replaceState(state, _, url) { assert.deepEqual(state, { retained: true }); f.win.location = new URL(url); } };
  f.win.document.createElement = () => ({ remove() {} });
  f.win.document.head = { appendChild(script) { scripts.push(script); } };
  f.pixel.setAttributionSource(() => ({ ...attribution, oppref: "opaque+value=" }));
  const load = () => {
    const queued = f.win.oaiq.q;
    f.win.oaiq = (...args) => f.calls.push(args);
    for (const args of queued) f.win.oaiq(...args);
    scripts.at(-1).onload();
  };
  return { ...f, scripts, load };
}

test("SDK loads once only for an eligible action and canonical alias preserves URL and hash", async () => {
  const f = loadingFixture();
  const page = f.pixel.pageViewed("/#/billing");
  const action = f.pixel.addBalanceClicked();
  assert.equal(f.scripts.length, 1);
  assert.deepEqual(f.win.oaiq.q, []);
  f.load();
  await Promise.all([page, action]);
  assert.equal(f.events().length, 2);
  assert.equal(f.win.location.searchParams.get("oppref"), "opaque+value=");
  assert.equal(f.win.location.searchParams.get("click_id"), "opaque+value=");
  assert.equal(f.win.location.hash, "#/billing");
});

test("withdrawal while the SDK downloads drops all initializations and measurements", async () => {
  const f = loadingFixture();
  const action = f.pixel.addBalanceClicked();
  f.pixel.setAttributionSource(() => null);
  f.pixel.syncConsent();
  f.load();
  await action;
  assert.equal(f.events().length, 0);
  assert.equal(f.calls.filter(([command]) => command === "init").length, 0);
});

test("SDK failure leaves checkout context usable and denied events are never replayed", async () => {
  const f = loadingFixture();
  const action = f.pixel.checkoutStarted(1000, "checkout");
  assert.ok(f.pixel.checkoutContext()?.attribution);
  f.scripts[0].onerror();
  await action;
  assert.equal(f.events().length, 0);
  f.pixel.setAttributionSource(() => null);
  await f.pixel.paymentProviderChosen("stripe");
  assert.equal(f.events().length, 0);
});

test("account changes purge SDK-queued business events before replacing matching identity", async () => {
  const f = fixture();
  let pending = [], user;
  f.win.oaiq = (command, ...args) => {
    f.calls.push([command, ...args]);
    if (command === "consent" && args[0] === false) pending = [];
    if (command === "init") user = args[0].user;
    if (command === "measure") pending.push(args);
  };
  await f.pixel.identify("old@example.com", "old");
  await f.pixel.addBalanceClicked();
  assert.equal(pending.length, 1);
  await f.pixel.identify("new@example.com", "new");
  assert.equal(pending.length, 0);
  assert.equal(user.email_sha256, hash("new@example.com"));
  await f.pixel.paymentProviderChosen("stripe");
  assert.equal(pending.length, 1);
});

test("invalid canonical references are replaced by the validated alias; valid references are retained", async () => {
  for (const [existing, expected] of [["bad reference", "opaque+value="], ["x".repeat(4097), "opaque+value="], ["valid-existing", "valid-existing"]]) {
    const f = loadingFixture();
    f.win.location.searchParams.set("oppref", existing);
    const page = f.pixel.pageViewed("/");
    f.load();
    await page;
    assert.equal(f.win.location.searchParams.get("oppref"), expected);
  }
});

test("an obsolete failed script cannot revoke a subsequent successful SDK load", async () => {
  const f = loadingFixture();
  f.pixel.syncConsent();
  const first = f.scripts[0];
  first.onerror();
  await Promise.resolve(); await Promise.resolve();
  const page = f.pixel.pageViewed("/");
  f.load();
  await page;
  const before = f.calls.length;
  first.onload();
  assert.equal(f.calls.length, before);
  await f.pixel.addBalanceClicked();
  assert.equal(f.events().length, 2);
});

test("initial identity and same-account customer ID enrichment preserve browser matching cookies", async () => {
  const f = fixture();
  await f.pixel.identify("person@example.com");
  await f.pixel.identify("person@example.com", "canonical-customer");
  assert.equal(f.calls.filter(([command, value]) => command === "consent" && value === false).length, 0);
  assert.equal(f.calls.at(-1)[1].user.external_id_sha256, hash("canonical-customer"));
});
