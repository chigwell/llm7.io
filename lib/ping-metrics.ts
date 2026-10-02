export type PingErrors = {
  total?: number;
  "4xx"?: number;
  "5xx"?: number;
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
  status_429?: number;
  response_time?: {
    average_seconds?: number;
    samples?: number;
  };
};

export type PingResponse = {
  message?: string;
  active_requests_last_60s?: number;
  unique_clients_last_60s?: number;
  unique_clients_last_60s_breakdown?: Record<string, number>;
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

function readFiniteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function clampRatio(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function createPingSnapshot(payload: PingResponse): PingSnapshot {
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
    { success200: 0, errorsTotal: 0, totalTokens: 0 },
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
