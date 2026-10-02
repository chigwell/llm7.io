import type { PingSnapshot } from "./ping-metrics";

type HeroStatus = {
  label: string;
  detail: string;
  percent: string | null;
  status: "active" | "warning" | "error" | "info";
};

type FormattedTokenCount = {
  value: number;
  suffix: string;
  decimals: number;
};

export function getFormattedTokenCount(value: number): FormattedTokenCount {
  if (value >= 1000000) {
    return {
      value: value / 1000000,
      suffix: "M",
      decimals: value >= 10000000 ? 0 : 1,
    };
  }

  if (value >= 1000) {
    return {
      value: value / 1000,
      suffix: "K",
      decimals: 2,
    };
  }

  return {
    value,
    suffix: "",
    decimals: 0,
  };
}

export function formatLiveTokenCount(value: number): string {
  const tokenCount = getFormattedTokenCount(value);
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: tokenCount.decimals,
  });

  return `${formatter.format(tokenCount.value)}${tokenCount.suffix}`;
}

export function formatStatusPercent(value: number): string {
  const digits = value >= 0.995 || value === 0 ? 0 : 1;
  return `${(value * 100).toFixed(digits)}%`;
}

export function createStatusFromSnapshot(
  snapshot: PingSnapshot | null,
  error: string | null,
): HeroStatus {
  if (error && !snapshot) {
    return {
      label: "LLM7.io: status delayed",
      detail: "Live model status is temporarily unavailable.",
      percent: null,
      status: "warning",
    };
  }

  if (!snapshot) {
    return {
      label: "LLM7.io: checking model status",
      detail: "Collecting live availability from the status endpoint.",
      percent: null,
      status: "info",
    };
  }

  if (snapshot.totalRequests === 0) {
    return {
      label: "LLM7.io: models quiet",
      detail: "No model traffic in the latest 60-second window.",
      percent: null,
      status: "info",
    };
  }

  const successRate = snapshot.successRate;
  const percent = formatStatusPercent(successRate);

  if (successRate >= 0.75) {
    return {
      label: "LLM7.io: models operational",
      detail: `${percent} success rate in the latest 60-second window.`,
      percent,
      status: "active",
    };
  }

  if (successRate >= 0.5) {
    return {
      label: "LLM7.io: partial degradation",
      detail: `${percent} success rate. Some model responses may fail or slow down.`,
      percent,
      status: "warning",
    };
  }

  return {
    label: "LLM7.io: degraded",
    detail: `${percent} success rate. Elevated errors detected.`,
    percent,
    status: "error",
  };
}
