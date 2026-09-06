"use client";

import { useEffect, useState } from "react";

import { createPingSnapshot, type PingResponse, type PingSnapshot } from "@/lib/ping-metrics";
export type { PingErrors, ModelMetrics, PingResponse, PingSnapshot } from "@/lib/ping-metrics";

type PingState = {
  payload: PingResponse | null;
  latest: PingSnapshot | null;
  error: string | null;
};

const PING_ENDPOINT = "https://api.llm7.io/ping";
const POLL_INTERVAL_MS = 1_000;

let latestState: PingState = {
  payload: null,
  latest: null,
  error: null,
};
let pollTimer: ReturnType<typeof setInterval> | null = null;
let activeSubscribers = 0;

const subscribers = new Set<(state: PingState) => void>();

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

    const payload = (await response.json()) as PingResponse;

    emit({
      payload,
      latest: createPingSnapshot(payload),
      error: null,
    });
  } catch (error) {
    emit({
      payload: latestState.payload,
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
