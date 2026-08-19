import type { PublicModel } from "./api-types";
import { formatBoolean, formatContext, formatPrice, formatRate } from "./format";
import { isProviderQuoteModel, providerQuotePriceLabel, providerQuoteTypical } from "./video-pricing";

export function capabilitySummary(model: PublicModel): string {
  const capabilities: string[] = [];
  if (model.modalities.input.includes("text")) capabilities.push("text input");
  if (model.modalities.input.includes("image") || model.capabilities.vision) capabilities.push("image input");
  if (model.capabilities.tools || model.tools_calling) capabilities.push("tool calling");
  if (model.stream || model.capabilities.stream) capabilities.push("streaming");
  if (model.json_mode || model.capabilities.json_mode) capabilities.push("JSON mode");
  if (model.reasoning || model.capabilities.reasoning) capabilities.push("reasoning");
  if (model.capabilities.image_generation) capabilities.push("image generation");
  if (model.capabilities.image_edits) capabilities.push("image editing");
  if (model.capabilities.video_generation) capabilities.push("video generation");
  return capabilities.length ? capabilities.join(", ") : "the published API capabilities";
}

export function modelDescription(model: PublicModel): string {
  if (model.model_type === "chat") {
    const context = model.context_window.tokens ? ` It provides a ${formatContext(model.context_window.tokens)} context window.` : "";
    return `${model.model_id} is a chat model available through the LLM7 API. It supports ${capabilitySummary(model)}.${context} It currently costs ${formatPrice(model)}.`;
  }
  if (model.model_type === "image") {
    return `${model.model_id} is an image-generation model available through the LLM7 API. It supports ${capabilitySummary(model)}, accepts ${model.modalities.input.join(" and ") || "published input modalities"}, and currently costs ${formatPrice(model)}.`;
  }
  const durations = model.capabilities.supported_seconds?.length ? ` Supported durations are ${model.capabilities.supported_seconds.join(", ")} seconds.` : "";
  const sizes = model.capabilities.supported_sizes?.length ? ` Published sizes include ${model.capabilities.supported_sizes.join(", ")}.` : "";
  if (isProviderQuoteModel(model)) {
    const typical = providerQuoteTypical(model.model_id);
    const reference = typical ? ` A recent ${typical.seconds}s ${typical.resolution} ${typical.requestType} reference is ${providerQuotePriceLabel(model.model_id)}.` : "";
    return `${model.model_id} is a video-generation model available through the LLM7 API.${durations}${sizes}${reference} Pricing is dynamic and billed at actual provider cost with no LLM7 markup.`;
  }
  return `${model.model_id} is a video-generation model available through the LLM7 API.${durations}${sizes} It currently costs ${formatPrice(model)}.`;
}

export function truncateDescription(value: string, maximum = 158): string {
  if (value.length <= maximum) return value;
  const clipped = value.slice(0, maximum - 1);
  return `${clipped.slice(0, clipped.lastIndexOf(" "))}…`;
}

export function statisticsSummary(model: PublicModel): string {
  const stats = model.statistics?.["30d"];
  if (!stats) return "Latest aggregated LLM7 statistics are not available for this period.";
  const parts = [
    stats.requests_total > 0 && stats.success_rate !== null ? `recent LLM7 stability ${formatRate(stats.success_rate)}` : null,
    stats.latency_observations > 0 && stats.latency_p95_ms !== null ? `p95 API response time ${stats.latency_p95_ms} ms` : null,
  ].filter(Boolean);
  return parts.length ? `Latest aggregated LLM7 statistics: ${parts.join("; ")}.` : "Latest aggregated LLM7 statistics are not available for this period.";
}

export function comparisonFacts(left: PublicModel, right: PublicModel): string[] {
  const facts: string[] = [];
  if (left.model_type === "chat" && left.context_window.tokens !== null && right.context_window.tokens !== null && left.context_window.tokens !== right.context_window.tokens) {
    facts.push(`${left.context_window.tokens > right.context_window.tokens ? left.model_id : right.model_id} has a larger context window.`);
  }
  if (left.modalities.input.includes("image") !== right.modalities.input.includes("image")) facts.push(`${left.modalities.input.includes("image") ? left.model_id : right.model_id} supports image input while the other model does not.`);
  const leftStats = left.statistics?.["30d"];
  const rightStats = right.statistics?.["30d"];
  if (leftStats && rightStats) {
    if (leftStats.requests_total >= 20 && rightStats.requests_total >= 20 && leftStats.success_rate !== null && rightStats.success_rate !== null) {
      const difference = Math.abs(leftStats.success_rate - rightStats.success_rate);
      facts.push(difference >= 0.01 ? `${leftStats.success_rate > rightStats.success_rate ? left.model_id : right.model_id} recorded higher recent LLM7 stability during this period.` : "The recent stability rates are too close to distinguish meaningfully.");
    } else facts.push("There is not enough recent LLM7 data for a reliable statistical comparison.");
    if (leftStats.latency_observations >= 20 && rightStats.latency_observations >= 20 && leftStats.latency_p95_ms !== null && rightStats.latency_p95_ms !== null) {
      const lower = leftStats.latency_p95_ms < rightStats.latency_p95_ms ? left : right;
      const relative = Math.abs(leftStats.latency_p95_ms - rightStats.latency_p95_ms) / Math.max(leftStats.latency_p95_ms, rightStats.latency_p95_ms);
      facts.push(relative >= 0.05 ? `${lower.model_id} recorded a lower observed p95 API latency on LLM7 during this period.` : "The observed latency difference is not material for this sample.");
    }
  }
  return facts;
}

export function commonSpecificationRows(model: PublicModel): Array<[string, string]> {
  return [
    ["Model type", model.model_type], ["Tier", model.tier ?? "Not specified"], ["Status", model.status], ["Pricing mode", model.pricing.mode], ["Currency", model.pricing.currency], ["Pricing unit", model.pricing.unit],
    ["Input modalities", model.modalities.input.join(", ") || "Not specified"], ["Output modalities", model.modalities.output.join(", ") || "Not specified"], ["API schemas", model.schema_endpoints.join(", ") || "Not specified"], ["Usage-based only", formatBoolean(model.usage_based_only)], ["Streaming", formatBoolean(model.stream)], ["JSON mode", formatBoolean(model.json_mode)], ["Reasoning", formatBoolean(model.reasoning)], ["Tool calling", formatBoolean(model.tools_calling)],
  ];
}
