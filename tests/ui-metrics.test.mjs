import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./support/load-typescript.mjs";
import { createGraph } from "../components/live-usage-flow/graph.js";
import {
  extractSnapshot,
  DEMO_PAYLOAD,
} from "../components/live-usage-flow/modelData.js";
const { createPingSnapshot } = loadTypeScript("lib/ping-metrics.ts");
const hero = loadTypeScript("lib/hero-metrics.ts");
const pricing = loadTypeScript("lib/models/live-pricing.ts");
test("ping totals and availability preserve finite-value and attempt rules", () => {
  const result = createPingSnapshot({
    model_metrics_last_60s: {
      A: {
        success_200: 3,
        errors: { total: 1 },
        tokens: { input: 1000, output: 500 },
        health: { attempts: 4, error_rate: 0.25 },
      },
      B: {
        success_200: Infinity,
        tokens: { input: NaN },
        health: { attempts: 0 },
      },
    },
  });
  assert.equal(result.totalRequests, 4);
  assert.equal(result.totalTokens, 1500);
  assert.equal(result.successRate, 0.75);
  assert.deepEqual(result.modelAvailability, { a: 0.75 });
});
test("hero status and number formatting retain exact thresholds", () => {
  assert.equal(hero.createStatusFromSnapshot(null, null).status, "info");
  assert.equal(
    hero.createStatusFromSnapshot(null, "offline").status,
    "warning",
  );
  const snapshot = { totalRequests: 1, successRate: 0.75 };
  assert.equal(
    hero.createStatusFromSnapshot(snapshot, "offline").status,
    "active",
  );
  assert.equal(
    hero.createStatusFromSnapshot({ ...snapshot, successRate: 0.5 }, null)
      .status,
    "warning",
  );
  assert.equal(
    hero.createStatusFromSnapshot({ ...snapshot, successRate: 0.49 }, null)
      .status,
    "error",
  );
  assert.equal(
    hero.createStatusFromSnapshot({ ...snapshot, totalRequests: 0 }, null)
      .label,
    "LLM7.io: models quiet",
  );
  for (const [value, label] of [
    [999, "999"],
    [1000, "1K"],
    [1500, "1.5K"],
    [1000000, "1M"],
    [10000000, "10M"],
  ])
    assert.equal(hero.formatLiveTokenCount(value), label);
});
test("live pricing keeps its numeric formatting, missing-price fallback, and provider ordering", () => {
  const a = pricing.transformApiModel({
    id: "gpt-5.5",
    pricing: { input: 0.1, output: 0.2, unit: "1M tokens" },
    context_window: { tokens: 1000 },
    stream: true,
  });
  assert.deepEqual(a.priceItems, [
    { label: "Input", value: "$0.10 / 1M tokens" },
    { label: "Output", value: "$0.20 / 1M tokens" },
  ]);
  assert.equal(a.contextWindow, "1k tokens");
  assert.deepEqual(a.chips, ["stream"]);
  assert.equal(
    pricing.transformApiModel({ id: "unknown" }).priceItems[0].value,
    "n/a / 1M tokens",
  );
  const input = [
    pricing.transformApiModel({ id: "qwen-model" }),
    a,
    pricing.transformApiModel({ id: "deepseek-model" }),
  ];
  assert.deepEqual(
    pricing.sortModelsByProvider(input).map((m) => m.id),
    ["gpt-5.5", "deepseek-model", "qwen-model"],
  );
  assert.equal(input[0].id, "qwen-model");
});
test("flow layout keeps compact and desktop stream identity and particle budgets", () => {
  const snapshot = extractSnapshot(DEMO_PAYLOAD);
  for (const theme of ["light", "dark"])
    for (const width of [390, 1440]) {
      const graph = createGraph(
        snapshot,
        { width, height: 760, viewportHeight: 760 },
        theme,
        "live",
      );
      assert.equal(graph.compact, width < 640);
      assert.equal(graph.nodes[0].id, "router");
      assert.equal(graph.streams.length, (graph.nodes.length - 1) * 2);
      assert(graph.renderedParticles <= 130000);
      assert(
        graph.nodes
          .slice(1)
          .every((n) => n.position.x >= 0 && n.position.y >= 0),
      );
    }
});

test("live pricing labels /v1/models audio-to-text entries as audio, not video", () => {
  const whisper = {
    id: "openai/whisper-large-v3-turbo",
    model_type: "audio_to_text",
    schema_endpoints: ["audio"],
    pricing_mode: "second",
    pricing: { price: 0.000003333334, currency: "USD", unit: "second" },
    modalities: { input: ["audio"], output: ["text"] },
    capabilities: { vision: true, tools: true, reasoning: true, json_mode: true, stream: true },
    stream: false,
    json_mode: false,
    reasoning: false,
    tools_calling: false,
  };
  assert.equal(pricing.isAudioToTextModel(whisper), true);
  assert.equal(pricing.isVideoModel(whisper), false);
  assert.deepEqual(pricing.modelChips(whisper), ["audio"]);
  assert.deepEqual(pricing.pricingItems(whisper), [
    { label: "Audio", value: "$0.0002 / minute" },
  ]);
  assert.equal(pricing.transformApiModel(whisper).videoPricing, undefined);
});
