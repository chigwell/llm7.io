import test from "node:test";
import assert from "node:assert/strict";
import { createOpenAiPixel } from "../lib/openai-pixel.js";

test("pixel page views deduplicate lifecycle repeats but track navigation and return visits", () => {
  const calls = [], win = {};
  const pixel = createOpenAiPixel(() => win);
  pixel.pageViewed("/models/");
  win.oaiq = (...args) => calls.push(args);
  pixel.pageViewed("/models/");
  pixel.pageViewed("/models/");
  pixel.pageViewed("/pricing/");
  pixel.pageViewed("/models/");
  assert.deepEqual(calls, Array.from({ length: 3 }, () => ["measure", "page_viewed", { type: "contents" }]));
});

test("pixel checkout uses only the requested payload and failures never escape", () => {
  const calls = [], win = { oaiq: (...args) => calls.push(args) };
  const pixel = createOpenAiPixel(() => win);
  pixel.checkoutStarted();
  assert.deepEqual(calls, [["measure", "checkout_started", { type: "contents" }]]);
  win.oaiq = () => { throw new Error("blocked SDK"); };
  assert.doesNotThrow(() => pixel.checkoutStarted());
  assert.doesNotThrow(() => pixel.pageViewed("/"));
  assert.doesNotThrow(() => createOpenAiPixel(() => null).checkoutStarted());
});
