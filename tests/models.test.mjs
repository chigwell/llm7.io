import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadTypeScript } from "./support/load-typescript.mjs";
import { models, model } from "./fixtures/models.mjs";
import { schemaResults } from "./support/schema-cases.mjs";
import * as cli from "../scripts/models/schemas.mjs";
import {
  createComparisonPairs,
  comparisonCountByType,
} from "../lib/models/comparison-values.js";
const schema = loadTypeScript("lib/models/schema.ts");
const format = loadTypeScript("lib/models/format.ts");
const parity = JSON.parse(
  readFileSync(new URL("./fixtures/schema-parity.json", import.meta.url)),
);

test("application and CLI retain their separate validation contracts", () => {
  assert.deepEqual(
    schemaResults(
      {
        detail: schema.ModelDetailSchema,
        list: schema.ModelListResponseSchema,
        metrics: schema.MetricsResponseSchema,
        summary: schema.StatisticsSummarySchema,
        version: schema.VersionResponseSchema,
      },
      (s, v) => s.parse(v),
    ),
    parity.app,
  );
  assert.deepEqual(
    schemaResults(
      {
        detail: cli.detailResponse,
        list: cli.listResponse,
        metrics: cli.metricsResponse,
        summary: cli.summaryResponse,
        version: cli.versionResponse,
      },
      (s, v) => cli.validate(s, v, "fixture"),
    ),
    parity.cli,
  );
});
test("decimal strings and actual token-unit parser retain precision and whitespace behavior", () => {
  for (const value of ["0", "0.0001", "1"])
    assert(schema.isNonNegativeDecimal(value));
  for (const value of ["-1", "01", "1e3", 1, null])
    assert(!schema.isNonNegativeDecimal(value));
  for (const [unit, expected] of [
    ["1M tokens", "1000000"],
    ["1000 tokens", "1000"],
    [" 1 token ", "1"],
    ["0.5k tokens", "500"],
  ])
    assert.equal(format.parseTokenPricingUnit(unit).toString(), expected);
  assert.equal(format.parseTokenPricingUnit("unknown"), null);
  assert.equal(format.decimalDurationPrice("0.0001", 3), "0.0003");
});
test("production comparison generation preserves ordering and excludes retired/cross-type pairs", () => {
  assert.deepEqual(createComparisonPairs(models), {
    "chat-a--vs--chat-b": { leftSlug: "chat-a", rightSlug: "chat-b" },
  });
  assert.deepEqual(comparisonCountByType(models), {
    chat: 1,
    image: 0,
    video: 0,
  });
  assert.deepEqual(createComparisonPairs([]), {});
  assert.deepEqual(createComparisonPairs([model("one")]), {});
  assert.equal(
    Object.keys(createComparisonPairs([...models, model("chat-z")])).length,
    3,
  );
});
test("provider field checks recurse while allowing upstream_attempts", () => {
  assert.doesNotThrow(() =>
    schema.assertNoProviderFields({ upstream_attempts: 2 }),
  );
  assert.throws(
    () => schema.assertNoProviderFields({ items: [{ owned_by: "x" }] }),
    /public.items\[0\].owned_by/,
  );
  assert.throws(
    () => schema.assertUniqueModels([models[0], models[0]]),
    /Duplicate public model_id/,
  );
});
test("cache price precedence and null display values remain stable", () => {
  assert.deepEqual(
    format.cachePriceEntries({
      cached_input: 0.2,
      public_price_usd_per_million: { cache_read: "0.001" },
    }),
    [{ key: "cache_read", label: "cache_read", value: "0.001" }],
  );
  assert.equal(format.formatRate(null), "Not available");
  assert.equal(
    format.formatPrice(model("image", "image")),
    "$0.05 USD per image",
  );
});

test("comparison facts use production sample thresholds and material differences", () => {
  const { comparisonFacts } = loadTypeScript("lib/models/content.ts");
  const left = model("left"),
    right = model("right");
  left.statistics["30d"].success_rate = 0.99;
  right.statistics["30d"].success_rate = 0.97;
  assert(
    comparisonFacts(left, right).some((f) =>
      f.includes("higher recent LLM7 stability"),
    ),
  );
  left.statistics["30d"].requests_total = 19;
  assert(
    !comparisonFacts(left, right).some((f) =>
      f.includes("recent LLM7 stability"),
    ),
  );
  left.statistics["30d"].requests_total = 20;
  right.statistics["30d"].success_rate = 0.985;
  assert(comparisonFacts(left, right).some((f) => f.includes("too close")));
});
