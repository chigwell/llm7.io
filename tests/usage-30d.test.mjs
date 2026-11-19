import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./support/load-typescript.mjs";

const { createUsageLoader, formatUsageCount, USAGE_CACHE_MS } = loadTypeScript("lib/usage-30d.ts");

test("formats totals without overstating the value", () => {
  for (const [value, expected] of [[9806862783, "9.8B+"], [2862760, "2.8M+"], [1234, "1.2k+"], [999, "999"], [0, "0"]]) {
    assert.equal(formatUsageCount(value), expected);
  }
});

test("shares requests and reuses local storage for five minutes", async () => {
  let time = 1_000_000;
  let calls = 0;
  let stored = null;
  const storage = { getItem: () => stored, setItem: (_, value) => { stored = value; } };
  const fetcher = async (_, options) => {
    calls++;
    assert.equal(options.cache, "no-store");
    return Response.json({ total_tokens: calls * 1000, total_requests: 10 });
  };
  const options = { fetcher, storage, now: () => time };
  const load = createUsageLoader(options);
  await Promise.all([load(), load()]);
  assert.equal(calls, 1);
  time += USAGE_CACHE_MS - 1;
  assert.equal((await createUsageLoader(options)()).total_tokens, 1000);
  assert.equal(calls, 1);
  time++;
  assert.equal((await load()).total_tokens, 2000);
  assert.equal(calls, 2);
});

test("rejects malformed statistics without caching them", async () => {
  let writes = 0;
  const load = createUsageLoader({ fetcher: async () => Response.json({ total_tokens: -1, total_requests: 2 }), storage: { getItem: () => null, setItem: () => writes++ } });
  await assert.rejects(load(), /Invalid usage statistics/);
  assert.equal(writes, 0);
});
