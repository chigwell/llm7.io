"use client";

import { useEffect, useState } from "react";

export type PingErrors = {
  total?: number;
  timeouts?: number;
};

export type ModelMetrics = {
  success_200?: number;
  errors?: PingErrors;
  tokens?: {
    input?: number;
    output?: number;
  };
  health?: {
    attempts?: number;
    error_rate?: number;
    routing_healthy?: boolean;
  };
};

export type PingResponse = {
  active_requests_last_60s?: number;
  model_metrics_last_60s?: Record<string, ModelMetrics>;
};

export type PingSnapshot = {
  collectedAt: number;
  activeRequestsLast60s: number;
  success200: number;
  errorsTotal: number;
  totalRequests: number;
  totalTokens: number;
  successRate: number;
  modelAvailability: Record<string, number>;
};

type PingState = {
  latest: PingSnapshot | null;
  error: string | null;
};

const PING_ENDPOINT = "https://api.llm7.io/ping";
const POLL_INTERVAL_MS = 1_000;

let latestState: PingState = {
  latest: null,
  error: null,
};
let pollTimer: ReturnType<typeof setInterval> | null = null;
let activeSubscribers = 0;

const subscribers = new Set<(state: PingState) => void>();

function readFiniteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function clampRatio(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function createPingSnapshot(payload: PingResponse): PingSnapshot {
  const modelMetrics = payload.model_metrics_last_60s ?? {};
  const modelAvailability: Record<string, number> = {};
  const totals = Object.values(modelMetrics).reduce(
    (accumulator, metrics) => {
      const success200 = readFiniteNumber(metrics.success_200);
      const errorsTotal = readFiniteNumber(metrics.errors?.total);
      const inputTokens = readFiniteNumber(metrics.tokens?.input);
      const outputTokens = readFiniteNumber(metrics.tokens?.output);

      return {
        success200: accumulator.success200 + success200,
        errorsTotal: accumulator.errorsTotal + errorsTotal,
        totalTokens: accumulator.totalTokens + inputTokens + outputTokens,
      };
    },
    { success200: 0, errorsTotal: 0, totalTokens: 0 }
  );

  Object.entries(modelMetrics).forEach(([modelName, metrics]) => {
    const attempts = readFiniteNumber(metrics.health?.attempts);

    if (modelName.trim().length > 0 && attempts > 0) {
      modelAvailability[modelName.toLowerCase()] =
        1 - clampRatio(readFiniteNumber(metrics.health?.error_rate));
    }
  });

  const totalRequests = totals.success200 + totals.errorsTotal;

  return {
    collectedAt: Date.now(),
    activeRequestsLast60s: readFiniteNumber(payload.active_requests_last_60s),
    success200: totals.success200,
    errorsTotal: totals.errorsTotal,
    totalRequests,
    totalTokens: totals.totalTokens,
    successRate: totalRequests > 0 ? totals.success200 / totalRequests : 0,
    modelAvailability,
  };
}

function emit(nextState: PingState) {
  latestState = nextState;
  subscribers.forEach((subscriber) => subscriber(latestState));
}

async function pollPing() {
  try {
    const response = await fetch(PING_ENDPOINT, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Ping endpoint returned HTTP ${response.status}`);
    }

    emit({
      latest: createPingSnapshot(await response.json()),
      error: null,
    });
  } catch (error) {
    emit({
      latest: latestState.latest,
      error: error instanceof Error ? error.message : "Unable to fetch ping metrics",
    });
  }
}

function startPolling() {
  if (pollTimer) return;

  void pollPing();
  pollTimer = setInterval(() => {
    void pollPing();
  }, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (!pollTimer) return;

  clearInterval(pollTimer);
  pollTimer = null;
}

export function usePingMetrics() {
  const [state, setState] = useState<PingState>(latestState);

  useEffect(() => {
    activeSubscribers += 1;
    subscribers.add(setState);
    setState(latestState);
    startPolling();

    return () => {
      activeSubscribers -= 1;
      subscribers.delete(setState);

      if (activeSubscribers <= 0) {
        activeSubscribers = 0;
        stopPolling();
      }
    };
  }, []);

  return state;
}
