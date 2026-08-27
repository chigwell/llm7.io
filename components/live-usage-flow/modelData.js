export const DEMO_PAYLOAD = {
  message: "pong",
  active_requests_last_60s: 377,
  unique_clients_last_60s: 93,
  unique_clients_last_60s_breakdown: { a: 38, t: 55, l: 0, p: 0 },
  model_metrics_last_60s: {
    "DeepSeek-V4-Flash-0731": {
      success_200: 2,
      errors: { total: 7, "4xx": 7, "5xx": 0, timeouts: 0 },
      status_429: 7,
      tokens: { input: 153983, output: 5847 },
      response_time: { average_seconds: 7.8958, samples: 9 },
      health: { attempts: 9, error_rate: 0.7777777778, routing_healthy: false },
    },
    "claude-sonnet-5": {
      success_200: 3,
      errors: { total: 0, "4xx": 0, "5xx": 0, timeouts: 0 },
      status_429: 0,
      tokens: { input: 268029, output: 3295 },
      response_time: { average_seconds: 21.205, samples: 3 },
      health: { attempts: 3, error_rate: 0, routing_healthy: true },
    },
    "codestral-latest": {
      success_200: 32,
      errors: { total: 0, "4xx": 0, "5xx": 0, timeouts: 0 },
      status_429: 0,
      tokens: { input: 65222, output: 7998 },
      response_time: { average_seconds: 1.8975, samples: 32 },
      health: { attempts: 32, error_rate: 0, routing_healthy: true },
    },
    "gemini-3.1-flash-lite": {
      success_200: 12,
      errors: { total: 0, "4xx": 0, "5xx": 0, timeouts: 0 },
      status_429: 0,
      tokens: { input: 46130, output: 1391 },
      response_time: { average_seconds: 1.2023, samples: 12 },
      health: { attempts: 12, error_rate: 0, routing_healthy: true },
    },
    "minimax-m2.7": {
      success_200: 9,
      errors: { total: 1, "4xx": 0, "5xx": 1, timeouts: 0 },
      status_429: 0,
      tokens: { input: 4910, output: 5832 },
      response_time: { average_seconds: 14.2676, samples: 10 },
      health: { attempts: 10, error_rate: 0.1, routing_healthy: true },
    },
    "mistral-Nemo-Instruct-2407": {
      success_200: 3,
      errors: { total: 0, "4xx": 0, "5xx": 0, timeouts: 0 },
      status_429: 0,
      tokens: { input: 4986, output: 55 },
      response_time: { average_seconds: 11.757, samples: 3 },
      health: { attempts: 3, error_rate: 0, routing_healthy: true },
    },
    "meta-Llama-3.1-8B-Instruct-Turbo": {
      success_200: 1,
      errors: { total: 0, "4xx": 0, "5xx": 0, timeouts: 0 },
      status_429: 0,
      tokens: { input: 18, output: 8 },
      response_time: { average_seconds: 0.89, samples: 1 },
      health: { attempts: 1, error_rate: 0, routing_healthy: true },
    },
  },
};

export const EMPTY_SNAPSHOT = {
  source: "empty",
  activeRequests: 0,
  uniqueClients: 0,
  clientBreakdown: {},
  models: [],
  totals: {
    tokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    attempts: 0,
    success: 0,
    errors: 0,
    errors4xx: 0,
    errors5xx: 0,
    timeouts: 0,
    status429: 0,
    avgSecondsWeighted: null,
    errorRate: 0,
    successRate: 1,
  },
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function maybeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function trimFixed(value) {
  return value.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

export function compactNumber(value) {
  const numeric = numberOrZero(value);
  const sign = numeric < 0 ? "-" : "";
  const abs = Math.abs(numeric);
  const units = [
    [1_000_000_000, "b"],
    [1_000_000, "m"],
    [1_000, "k"],
  ];

  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      const scaled = abs / threshold;
      const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return `${sign}${trimFixed(scaled.toFixed(digits))}${suffix}`;
    }
  }

  return `${sign}${Math.round(abs).toLocaleString("en-GB")}`;
}

export function fullNumber(value) {
  return Math.round(numberOrZero(value)).toLocaleString("en-GB");
}

export function formatPercent(value) {
  const numeric = clamp(numberOrZero(value), 0, 1);
  const digits = numeric > 0 && numeric < 0.01 ? 2 : 1;
  return `${(numeric * 100).toFixed(digits)}%`;
}

export function formatSeconds(value) {
  const numeric = maybeNumber(value);
  if (numeric === null) return "—";
  if (numeric < 1) return `${Math.round(numeric * 1000)}ms`;
  return `${numeric.toFixed(numeric >= 10 ? 1 : 2)}s`;
}

export function safeId(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function stableId(value) {
  const raw = String(value ?? "");
  let hash = 2166136261;
  for (let index = 0; index < raw.length; index += 1) {
    hash ^= raw.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${safeId(raw) || "item"}-${(hash >>> 0).toString(36)}`;
}

export function clientLabel(key) {
  return {
    a: "anon",
    t: "token",
    l: "llm7",
    p: "paid",
  }[key] || key;
}


export function statusForModel(model) {
  if (!model.routingHealthy || model.errorRate >= 0.5) return "bad";
  if (model.errorRate >= 0.1 || model.timeouts > 0 || model.errors5xx > 0) return "warn";
  return "ok";
}


export function extractSnapshot(payload, source = "live") {
  if (!payload || typeof payload !== "object") return EMPTY_SNAPSHOT;

  const metrics = payload.model_metrics_last_60s || {};
  const models = Object.entries(metrics).map(([name, raw]) => {
    const inputTokens = numberOrZero(raw?.tokens?.input);
    const outputTokens = numberOrZero(raw?.tokens?.output);
    const tokens = inputTokens + outputTokens;
    const success = numberOrZero(raw?.success_200);
    const errors = raw?.errors || {};
    const errorsTotal = numberOrZero(errors.total);
    const errors4xx = numberOrZero(errors["4xx"]);
    const errors5xx = numberOrZero(errors["5xx"]);
    const timeouts = numberOrZero(errors.timeouts);
    const status429 = numberOrZero(raw?.status_429);
    const attempts = numberOrZero(raw?.health?.attempts) || success + errorsTotal;
    const healthErrorRate = maybeNumber(raw?.health?.error_rate);
    const errorRate = healthErrorRate !== null ? healthErrorRate : attempts > 0 ? errorsTotal / attempts : 0;
    const avgSeconds = maybeNumber(raw?.response_time?.average_seconds);
    const responseSamples = numberOrZero(raw?.response_time?.samples);
    const routingHealthy = raw?.health?.routing_healthy !== false;

    return {
      name,
      displayName: name.replace(/^chigwell\//u, ""),
      inputTokens,
      outputTokens,
      tokens,
      success,
      errorsTotal,
      errors4xx,
      errors5xx,
      timeouts,
      status429,
      attempts,
      errorRate,
      successRate: attempts > 0 ? success / attempts : 1,
      avgSeconds,
      responseSamples,
      routingHealthy,
      isAggregate: false,
      childrenCount: 0,
    };
  });

  const totals = models.reduce(
    (acc, model) => {
      acc.tokens += model.tokens;
      acc.inputTokens += model.inputTokens;
      acc.outputTokens += model.outputTokens;
      acc.attempts += model.attempts;
      acc.success += model.success;
      acc.errors += model.errorsTotal;
      acc.errors4xx += model.errors4xx;
      acc.errors5xx += model.errors5xx;
      acc.timeouts += model.timeouts;
      acc.status429 += model.status429;
      acc.samples += model.responseSamples;
      if (model.avgSeconds !== null) {
        acc.weightedSeconds += model.avgSeconds * Math.max(1, model.responseSamples);
      }
      return acc;
    },
    {
      tokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      attempts: 0,
      success: 0,
      errors: 0,
      errors4xx: 0,
      errors5xx: 0,
      timeouts: 0,
      status429: 0,
      samples: 0,
      weightedSeconds: 0,
    },
  );

  const avgSecondsWeighted = totals.samples > 0 ? totals.weightedSeconds / totals.samples : null;
  const errorRate = totals.attempts > 0 ? totals.errors / totals.attempts : 0;

  return {
    source,
    activeRequests: numberOrZero(payload.active_requests_last_60s),
    uniqueClients: numberOrZero(payload.unique_clients_last_60s),
    clientBreakdown: payload.unique_clients_last_60s_breakdown || {},
    models,
    totals: {
      ...totals,
      avgSecondsWeighted,
      errorRate,
      successRate: totals.attempts > 0 ? totals.success / totals.attempts : 1,
    },
  };
}


export function sortModels(models) {
  return [...models].sort((a, b) => {
    const aHasTokens = a.tokens > 0;
    const bHasTokens = b.tokens > 0;
    if (aHasTokens !== bHasTokens) return bHasTokens ? 1 : -1;

    if (aHasTokens && bHasTokens) {
      const bySuccess = b.successRate - a.successRate;
      if (Math.abs(bySuccess) > 0.0001) return bySuccess;
      const byTokens = b.tokens - a.tokens;
      if (byTokens !== 0) return byTokens;
      return b.attempts - a.attempts;
    }

    const byAttempts = b.attempts - a.attempts;
    if (byAttempts !== 0) return byAttempts;
    const bySuccess = b.successRate - a.successRate;
    if (Math.abs(bySuccess) > 0.0001) return bySuccess;
    return a.displayName.localeCompare(b.displayName, "en", {
      numeric: true,
      sensitivity: "base",
    });
  });
}

function aggregateModels(models) {
  const totals = models.reduce(
    (acc, model) => {
      acc.inputTokens += model.inputTokens;
      acc.outputTokens += model.outputTokens;
      acc.tokens += model.tokens;
      acc.success += model.success;
      acc.errorsTotal += model.errorsTotal;
      acc.errors4xx += model.errors4xx;
      acc.errors5xx += model.errors5xx;
      acc.timeouts += model.timeouts;
      acc.status429 += model.status429;
      acc.attempts += model.attempts;
      acc.responseSamples += model.responseSamples;
      if (model.avgSeconds !== null) {
        acc.weightedSeconds += model.avgSeconds * Math.max(1, model.responseSamples);
      }
      acc.routingHealthy = acc.routingHealthy && model.routingHealthy;
      return acc;
    },
    {
      inputTokens: 0,
      outputTokens: 0,
      tokens: 0,
      success: 0,
      errorsTotal: 0,
      errors4xx: 0,
      errors5xx: 0,
      timeouts: 0,
      status429: 0,
      attempts: 0,
      responseSamples: 0,
      weightedSeconds: 0,
      routingHealthy: true,
    },
  );

  return {
    name: "Other active models",
    displayName: "Other active models",
    ...totals,
    errorRate: totals.attempts > 0 ? totals.errorsTotal / totals.attempts : 0,
    successRate: totals.attempts > 0 ? totals.success / totals.attempts : 1,
    avgSeconds: totals.responseSamples > 0 ? totals.weightedSeconds / totals.responseSamples : null,
    isAggregate: true,
    childrenCount: models.length,
  };
}

export function visibleModelsForViewport(snapshot, viewportHeight = 760, compact = false) {
  const sorted = sortModels(snapshot.models);
  const availableRows = compact
    ? Math.floor((numberOrZero(viewportHeight) - 420) / 74)
    : Math.floor((numberOrZero(viewportHeight) - 120) / 74);
  const capacity = compact ? clamp(availableRows, 4, 6) : clamp(availableRows, 7, 13);

  if (sorted.length <= capacity) return sorted;

  const visible = sorted.slice(0, capacity - 1);
  const hidden = sorted.slice(capacity - 1);
  return [...visible, aggregateModels(hidden)];
}
