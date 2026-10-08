import type { ApiModel, ApiModelsResponse } from "./live-api-types";
import { currentPricing, type CurrentPricing } from "./current-pricing";

export const MODELS_API_URL = "https://api.llm7.io/v1/models";
export const MODELS_REFRESH_INTERVAL_MS = 180_000;
export type LiveModelsSnapshot = {
  models: ApiModel[] | null;
  prices: ReadonlyMap<string, CurrentPricing>;
  state: "loading" | "ready" | "error";
  updatedAt: number | null;
};
const serverSnapshot: LiveModelsSnapshot = { models: null, prices: new Map(), state: "loading", updatedAt: null };

export function isApiModelsResponse(value: unknown): value is ApiModelsResponse {
  if (!value || typeof value !== "object" || !Array.isArray((value as ApiModelsResponse).data)) return false;
  const ids = new Set<string>();
  return (value as ApiModelsResponse).data.every(model => {
    if (!model || typeof model.id !== "string" || !model.id.trim() || ids.has(model.id)) return false;
    ids.add(model.id);
    return true;
  });
}

export function createLiveModelsStore({
  fetcher = (...args: Parameters<typeof fetch>) => fetch(...args),
  now = Date.now,
  refreshIntervalMs = MODELS_REFRESH_INTERVAL_MS,
  timeoutMs = 10_000,
} = {}) {
  let snapshot = serverSnapshot;
  let request: Promise<void> | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<() => void>();
  const publish = (next: LiveModelsSnapshot) => { snapshot = next; listeners.forEach(listener => listener()); };
  const refresh = (force = false): Promise<void> => {
    if (request) return request;
    if (!force && snapshot.state === "ready" && snapshot.updatedAt !== null && now() - snapshot.updatedAt < refreshIntervalMs) return Promise.resolve();
    request = Promise.resolve().then(async () => {
      if (snapshot.state === "error") publish({ ...snapshot, state: "loading", prices: new Map() });
      const controller = new AbortController();
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        const data = await Promise.race([
          (async () => {
            const response = await fetcher(MODELS_API_URL, { cache: "no-store", credentials: "omit", signal: controller.signal });
            if (!response.ok) throw new Error(`Model pricing HTTP ${response.status}`);
            return response.json() as Promise<unknown>;
          })(),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(() => { controller.abort(); reject(new Error("Model pricing timed out")); }, timeoutMs);
          }),
        ]);
        if (!isApiModelsResponse(data)) throw new Error("Invalid model catalogue");
        const prices = new Map<string, CurrentPricing>();
        for (const model of data.data) {
          const price = currentPricing(model);
          if (price) prices.set(model.id, price);
        }
        publish({ models: data.data, prices, state: "ready", updatedAt: now() });
      } catch {
        // Keep the last catalogue for the homepage's labelled fallback, but do not
        // expose stale rates to current-price displays, sorting or calculators.
        publish({ ...snapshot, prices: new Map(), state: "error" });
      } finally {
        clearTimeout(timeout);
        request = null;
      }
    });
    return request;
  };
  const onFocus = () => { if (typeof document === "undefined" || document.visibilityState !== "hidden") void refresh(); };
  const onInterval = () => { if (typeof document === "undefined" || document.visibilityState !== "hidden") void refresh(true); };
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    refresh,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        void refresh();
        timer = setInterval(onInterval, refreshIntervalMs);
        if (typeof window !== "undefined") {
          window.addEventListener("focus", onFocus);
          window.addEventListener("pageshow", onFocus);
          document.addEventListener("visibilitychange", onFocus);
        }
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          if (timer) clearInterval(timer);
          timer = null;
          if (typeof window !== "undefined") {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("pageshow", onFocus);
            document.removeEventListener("visibilitychange", onFocus);
          }
        }
      };
    },
  };
}

export const liveModelsStore = createLiveModelsStore();
