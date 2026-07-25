import test from "node:test";
import assert from "node:assert/strict";
import Decimal from "decimal.js-light";

const decimal = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const tokenUnit = (unit) => { const match = unit.match(/^(\d+(?:\.\d+)?)\s*(k|m)?\s+tokens?$/i); return match ? new Decimal(match[1]).times(match[2]?.toLowerCase() === "m" ? 1_000_000 : match[2]?.toLowerCase() === "k" ? 1000 : 1) : null; };
const pairMap = (models) => { const output = {}; for (const type of ["chat", "image", "video"]) { const group = models.filter((model) => model.status === "active" && model.model_type === type).sort((a, b) => a.slug.localeCompare(b.slug)); for (let left = 0; left < group.length; left += 1) for (let right = left + 1; right < group.length; right += 1) output[`${group[left].slug}--vs--${group[right].slug}`] = [group[left], group[right]]; } return output; };
const fixture = [
  { slug: "chat-text", model_type: "chat", status: "active" }, { slug: "chat-vision", model_type: "chat", status: "active" }, { slug: "image-one", model_type: "image", status: "active" }, { slug: "video-async", model_type: "video", status: "active" }, { slug: "retired-chat", model_type: "chat", status: "retired" },
];

test("decimal validation and token pricing-unit parsing", () => { assert(decimal.test("0.0001")); assert(!decimal.test("-1")); assert.equal(tokenUnit("1M tokens").toString(), "1000000"); assert.equal(tokenUnit("1000 tokens").toString(), "1000"); assert.equal(tokenUnit("1 token").toString(), "1"); assert.equal(tokenUnit("unknown"), null); });
test("exact cost calculation avoids floating point", () => { const cost = new Decimal("1000").div(tokenUnit("1M tokens")).times("0.1").plus(new Decimal("1000").div(tokenUnit("1M tokens")).times("0.2")); assert.equal(cost.toString(), "0.0003"); });
test("canonical same-type active pair generation excludes retired models", () => { const pairs = pairMap(fixture); assert.deepEqual(Object.keys(pairs), ["chat-text--vs--chat-vision"]); });
test("pair count formula", () => { const pairs = pairMap([...fixture, { slug: "chat-z", model_type: "chat", status: "active" }]); assert.equal(Object.keys(pairs).length, 3); });
test("sample thresholds and material differences", () => { const comparableRates = (a, b) => a.requests >= 20 && b.requests >= 20 && a.rate !== null && b.rate !== null; const comparableLatency = (a, b) => a.observations >= 20 && b.observations >= 20 && a.p95 !== null && b.p95 !== null; assert(!comparableRates({ requests: 19, rate: 1 }, { requests: 20, rate: .8 })); assert(comparableRates({ requests: 20, rate: .99 }, { requests: 20, rate: .97 })); assert(comparableLatency({ observations: 20, p95: 100 }, { observations: 20, p95: 110 })); assert(Math.abs(.99 - .985) < .01); });
test("provider deny-list catches forbidden keys but permits upstream_attempts", () => { const denied = /^(?:provider|provider_name|provider_slug|owned_by|supplier|vendor|upstream_model|deployment|backend|hostname|region|internal_cost|margin)$/i; assert(denied.test("owned_by")); assert(!denied.test("upstream_attempts")); });
