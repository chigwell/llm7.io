export const USAGE_30D_URL = "https://api.llm7.io/public/v1/statistics/usage-30d";
export const USAGE_CACHE_MS = 5 * 60 * 1000;
const CACHE_KEY = "llm7_usage_30d_v1";

export type Usage30d = { total_tokens: number; total_requests: number };

function isUsage(value: unknown): value is Usage30d {
  if (!value || typeof value !== "object") return false;
  const usage = value as Usage30d;
  return [usage.total_tokens, usage.total_requests].every((n) => Number.isSafeInteger(n) && n >= 0);
}

export function formatUsageCount(value: number): string {
  for (const [threshold, suffix] of [[1e9, "B"], [1e6, "M"], [1e3, "k"]] as const) {
    if (value >= threshold) return `${Math.floor(value / threshold * 10) / 10}${suffix}+`;
  }
  return String(value);
}

export function createUsageLoader({ fetcher = fetch, now = Date.now, storage }: {
  fetcher?: typeof fetch; now?: () => number; storage?: Pick<Storage, "getItem" | "setItem">;
} = {}) {
  let cached: { data: Usage30d; savedAt: number } | null = null;
  let pending: Promise<Usage30d> | null = null;
  try {
    const raw = storage?.getItem(CACHE_KEY);
    if (raw) {
      const item = JSON.parse(raw);
      if (isUsage(item?.data) && Number.isFinite(item.savedAt)) cached = item;
    }
  } catch { /* Storage can be unavailable or contain invalid data. */ }

  return function load(): Promise<Usage30d> {
    if (cached && now() >= cached.savedAt && now() - cached.savedAt < USAGE_CACHE_MS) return Promise.resolve(cached.data);
    if (pending) return pending;
    pending = (async () => {
      const response = await fetcher(USAGE_30D_URL, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error(`Usage HTTP ${response.status}`);
      const data: unknown = await response.json();
      if (!isUsage(data)) throw new Error("Invalid usage statistics");
      cached = { data, savedAt: now() };
      try { storage?.setItem(CACHE_KEY, JSON.stringify(cached)); } catch { /* In-memory cache remains available. */ }
      return data;
    })().finally(() => { pending = null; });
    return pending;
  };
}
