import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  alternatives,
  capability,
  configuration,
  definePages,
  estimate,
  featureExample,
  integrationEligible,
} from "../lib/discovery/pages.js";
import { pageState } from "../lib/discovery/fingerprints.js";
import { parseTokenPricingUnit } from "../lib/models/token-unit.js";
const model = (id = "a", overrides = {}) => ({
  model_id: id,
  slug: id,
  display_name: id,
  status: "active",
  model_type: "chat",
  capabilities: { tools: true, json_mode: true },
  modalities: { input: ["text"], output: ["text"] },
  context_window: { tokens: 128000 },
  api_interfaces: [{ path: "/v1/chat/completions", method: "POST" }],
  pricing: {
    currency: "USD",
    mode: "token",
    unit: "1M tokens",
    input: "0.1",
    output: "0.4",
  },
  ...overrides,
});
test("explicit capabilities, precedence, image vision, unknowns and thresholds", () => {
  assert.equal(capability(model(), "tool-calling"), true);
  assert.equal(
    capability(model("a", { tools_calling: false }), "tool-calling"),
    false,
  );
  assert.equal(
    capability(model("a", { tools_calling: null }), "tool-calling"),
    null,
  );
  assert.equal(capability(model(), "streaming"), null);
  assert.equal(
    capability(
      model("a", {
        vision: false,
        modalities: { input: ["image"], output: ["text"] },
      }),
      "vision",
    ),
    true,
  );
  assert.equal(
    capability(
      model("jev-latest", {
        model_type: "systemone",
        capabilities: { vision: true },
        modalities: { input: ["text", "json"], output: ["json"] },
      }),
      "vision",
    ),
    false,
  );
  assert.equal(capability(model(), "long-context"), true);
  assert.equal(
    capability(
      model("a", { context_window: { tokens: 127999 } }),
      "long-context",
    ),
    false,
  );
  assert.equal(
    capability(
      model("a", { context_window: { tokens: null } }),
      "long-context",
    ),
    null,
  );
});
test("integration selection requires active chat interface and Hermes 64000 tokens", () => {
  for (const tokens of [null, 63999, 0])
    assert.equal(
      integrationEligible(
        model("a", { context_window: { tokens } }),
        "hermes-agent",
      ),
      false,
    );
  assert.equal(
    integrationEligible(
      model("a", { context_window: { tokens: 64000 } }),
      "hermes-agent",
    ),
    true,
  );
  assert.equal(
    integrationEligible(model("a", { status: "retired" }), "n8n"),
    false,
  );
  assert.equal(
    integrationEligible(model("a", { tools_calling: false }), "openclaw"),
    false,
  );
  assert.equal(
    integrationEligible(model("a", { tools_calling: false }), "n8n"),
    true,
  );
  assert.equal(
    integrationEligible(
      model("a", {
        api_interfaces: [{ path: "/v1/responses", method: "POST" }],
      }),
      "n8n",
    ),
    false,
  );
});
test("deterministic alternatives, retired original, same type, self exclusion, unknown context last", () => {
  const original = model("a", { status: "retired" });
  const candidates = [
    model("d", { context_window: { tokens: null } }),
    model("c"),
    model("b"),
    original,
    model("e", { status: "retired" }),
    model("f", { model_type: "image" }),
  ];
  assert.deepEqual(
    alternatives(original, candidates).map((m) => m.model_id),
    ["b", "c", "d"],
  );
  assert.deepEqual(
    alternatives(original, candidates.reverse()).map((m) => m.model_id),
    ["b", "c", "d"],
  );
  assert.deepEqual(
    alternatives(model(), [model(), model("b")]).map((m) => m.model_id),
    ["b"],
  );
  const pages = definePages({ models: candidates.map((model) => ({ model })) });
  assert.ok(pages.find((p) => p.path === "/models/a/alternatives/"));
  assert.ok(
    !definePages({ models: [{ model: model() }] }).some(
      (p) => p.family === "alternatives",
    ),
  );
});
test("token units and exact decimal arithmetic, per-request floors and zero requests", () => {
  assert.equal(parseTokenPricingUnit("1M tokens").toString(), "1000000");
  assert.equal(parseTokenPricingUnit(" 2.5 k tokens ").toString(), "2500");
  assert.equal(parseTokenPricingUnit("1 token").toString(), "1");
  assert.equal(parseTokenPricingUnit("seconds"), null);
  assert.equal(estimate(model(), 10000, 2000, 500).cost, "4");
  assert.equal(
    estimate(
      model("a", {
        pricing: { ...model().pricing, minimum_request_usd: "0.001" },
      }),
      10000,
      2000,
      500,
    ).cost,
    "10",
  );
  assert.equal(
    estimate(
      model("a", { pricing: { ...model().pricing, minimum_request_usd: "1" } }),
      0,
      0,
      0,
    ).cost,
    "0",
  );
  assert.equal(
    estimate(
      model("a", { pricing: { ...model().pricing, unit: "1K tokens" } }),
      1,
      1,
      1,
    ).cost,
    "0.0005",
  );
});
test("invalid quantities, unknown prices, context boundaries and dynamic quotes", () => {
  for (const value of ["", -1, "NaN", "Infinity", "1.5", "1e3", "1000000001"])
    assert.equal(estimate(model(), value, 1, 1).status, "Invalid input");
  assert.equal(estimate(model(), 1, 127999, 1).status, "Within context");
  assert.match(estimate(model(), 1, 128000, 1).status, /Unsuitable/);
  assert.equal(
    estimate(model("a", { context_window: { tokens: null } }), 1, 1, 1).status,
    "Unknown context",
  );
  for (const pricing of [
    { ...model().pricing, input: undefined },
    { ...model().pricing, unit: "0 tokens" },
    { ...model().pricing, billing_strategy: "provider_quote" },
  ])
    assert.equal(estimate(model("a", { pricing }), 1, 1, 1).cost, null);
});
test("empty fixed pages, JSON eligibility, retired exclusion and reserved slug", () => {
  const pages = definePages({ models: [] });
  assert.equal(pages.length, 17);
  assert.ok(pages.every((p) => !p.indexable));
  const populated = definePages({
    models: [
      { model: model("a", { json_mode: false }) },
      { model: model("b", { status: "retired" }) },
    ],
  });
  assert.equal(
    populated.find((p) => p.slug === "json-extraction").models.length,
    0,
  );
  assert.throws(
    () => definePages({ models: [{ model: model("features") }] }),
    /Reserved/,
  );
});
test("configuration substitution and known-only OpenClaw limits", () => {
  for (const id of ["exact/model:v2", "second-model"]) {
    const m = model(id);
    for (const slug of [
      "hermes-agent",
      "openclaw",
      "n8n",
      "langchain",
      "vercel-ai-sdk",
    ]) {
      const config = configuration(slug, m);
      assert.ok(config.includes(id));
      assert.ok(config.includes("https://api.llm7.io/v1"));
      assert.ok(config.includes("YOUR_LLM7_API_KEY"));
    }
    const claw = JSON.parse(configuration("openclaw", m));
    assert.equal(claw.models.providers.llm7.api, "openai-completions");
    assert.equal(claw.models.providers.llm7.models[0].contextWindow, 128000);
    assert.equal(claw.agents.defaults.model.primary, `llm7/${id}`);
  }
  const unknown = JSON.parse(
    configuration("openclaw", model("a", { context_window: { tokens: null } })),
  ).models.providers.llm7.models[0];
  assert.ok(!("contextWindow" in unknown));
  assert.ok(!("maxTokens" in unknown));
  assert.ok(!("cost" in unknown));
  assert.match(configuration("n8n", model()), /Use Responses API: disabled/);
  assert.match(configuration("langchain", model()), /use_responses_api=False/);
  assert.match(configuration("vercel-ai-sdk", model()), /chatModel\("a"\)/);
  for (const slug of [
    "tool-calling",
    "vision",
    "long-context",
    "json-mode",
    "streaming",
    "reasoning",
  ])
    assert.equal(
      JSON.parse(featureExample(slug, model()).split("\n\n")[1]).model,
      "a",
    );
});
test("stable lastmod across metric refreshes; changes follow content, templates and membership", () => {
  const snapshot = { models: [{ model: model() }] };
  const pages = definePages(snapshot);
  const first = pageState(pages, {}, "2026-09-01T00:00:00Z", "v1");
  snapshot.models[0].model.updated_at = "2026-09-02";
  snapshot.models[0].model.statistics = { requests: 100 };
  assert.deepEqual(
    pageState(definePages(snapshot), first, "2026-09-02T00:00:00Z", "v1"),
    first,
  );
  const template = pageState(pages, first, "2026-09-02T00:00:00Z", "v2");
  assert.ok(
    Object.values(template).every((p) => p.lastmod === "2026-09-02T00:00:00Z"),
  );
  snapshot.models[0].model.pricing.input = "0.2";
  const changed = pageState(
    definePages(snapshot),
    first,
    "2026-09-03T00:00:00Z",
    "v1",
  );
  assert.equal(changed["/integrations/n8n/"].lastmod, "2026-09-03T00:00:00Z");
  assert.deepEqual(pageState([], first), {});
});
test("real snapshot definitions contain unique paths and eligible memberships", async () => {
  const snapshot = JSON.parse(
    await readFile(
      new URL("../tests/fixtures/synchronized-snapshot.json", import.meta.url),
    ),
  );
  const pages = definePages(snapshot);
  assert.equal(new Set(pages.map((p) => p.path)).size, pages.length);
  for (const p of pages.filter(
    (p) => p.family === "integrations" && !p.children,
  ))
    assert.ok(p.models.every((m) => integrationEligible(m, p.slug)));
});
