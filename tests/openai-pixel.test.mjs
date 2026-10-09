import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto, createHash } from "node:crypto";
import { createOpenAiPixel } from "../lib/openai-pixel.js";
const receipt = { version: 1, choice: "allowed", consent_id: "93c785b3-c9dd-4a98-9c58-fcc67c8126be", consented_at: new Date().toISOString() };
const hash = value => createHash("sha256").update(value).digest("hex");
function fixture() {
  const calls = [], win = { crypto: webcrypto, document: { cookie: `llm7_ads_consent=${encodeURIComponent(JSON.stringify(receipt))}` }, oaiq: (...args) => calls.push(args) };
  return { calls, win, pixel: createOpenAiPixel(() => win), events: () => calls.filter(([command]) => command === "measure") };
}
test("pixel page views require consent and deduplicate repeated lifecycle calls", () => {
  const f = fixture();
  f.pixel.pageViewed("/models/"); f.pixel.pageViewed("/models/"); f.pixel.pageViewed("/pricing/"); f.pixel.pageViewed("/models/");
  assert.equal(f.events().length, 3);
  f.win.document.cookie = "";
  f.pixel.pageViewed("/other/");
  assert.equal(f.events().length, 3);
  assert.deepEqual(f.calls.at(-1), ["consent", false]);
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
  assert.deepEqual(f.pixel.checkoutContext(), { consent_id: receipt.consent_id, consented_at: receipt.consented_at });
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

test("opaque attribution cookies pass through unchanged while consent is decoded", () => {
  const f = fixture();
  f.win.document.cookie += "; __oppref=opaque%2Bclick%3D; __obref=opaque%2Fbrowser%25";
  assert.deepEqual(f.pixel.checkoutContext(), {
    consent_id: receipt.consent_id, consented_at: receipt.consented_at,
    oppref: "opaque%2Bclick%3D", obref: "opaque%2Fbrowser%25",
  });
});
