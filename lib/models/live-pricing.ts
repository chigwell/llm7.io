import type { ApiModel } from "@/hooks/use-llm7-models";
import { cachePriceEntries } from "./format";
import { logoDetailsForModelId } from "./logos";
import {
  isProviderQuoteModel,
  providerQuotePriceLabel,
  providerQuoteTypical,
  startingVideoPrice,
  videoPriceOptions,
  type VideoPricing,
} from "./video-pricing";

export type PayModel = {
  id: string;
  name: string;
  provider: string;
  lightLogo?: string;
  darkLogo?: string;
  tier?: string;
  chips: Array<"audio" | "systemone" | "typed" | "noul" | "choice" | "score" | "confidence" | "tools" | "vision" | "video" | "json" | "stream" | "reasoning">;
  contextWindow: string;
  priceItems: Array<{
    label: string;
    value: string;
  }>;
  minimumRequestPrice?: string;
  videoPricing?: VideoPricing;
  providerQuote?: boolean;
  providerQuoteHasTypical?: boolean;
  usageBasedOnly?: boolean;
  availabilityLastHourPercent?: number;
  availability?: {
    old?: number;
    mid?: number;
    recent?: number;
  };
};

export function formatUsd(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "n/a";

  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

export function formatContextWindow(model: ApiModel) {
  const tokens = model.context_window?.tokens;
  if (typeof tokens === "number" && Number.isFinite(tokens)) {
    if (tokens >= 1_000_000) return `${tokens / 1_000_000}M tokens`;
    if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}k tokens`;
    return `${tokens.toLocaleString("en-US")} tokens`;
  }

  const chars = model.context_window?.chars;
  if (typeof chars === "number" && Number.isFinite(chars)) {
    if (chars >= 1_000_000) return `${chars / 1_000_000}M chars`;
    if (chars >= 1_000) return `${Math.round(chars / 1_000)}k chars`;
    return `${chars.toLocaleString("en-US")} chars`;
  }

  return "Not listed";
}

export function modelChips(model: ApiModel): PayModel["chips"] {
  const outputModalities = model.modalities?.output ?? [];
  const isVideoModel =
    model.model_type?.toLowerCase() === "video" ||
    outputModalities.includes("video") ||
    model.capabilities?.video_generation === true;
  const isSystemOneModel =
    model.model_type?.toLowerCase() === "systemone" ||
    model.schema_endpoints?.includes("systemone") ||
    model.capabilities?.systemone === true;

  return [
    isAudioToTextModel(model) ? "audio" : null,
    isSystemOneModel ? "systemone" : null,
    model.capabilities?.typed_answers === true ? "typed" : null,
    model.capabilities?.noul === true ? "noul" : null,
    model.capabilities?.choice === true ? "choice" : null,
    model.capabilities?.score === true ? "score" : null,
    model.capabilities?.confidence === true ? "confidence" : null,
    model.tools_calling ? "tools" : null,
    model.modalities?.input?.includes("image") ? "vision" : null,
    isVideoModel ? "video" : null,
    model.json_mode ? "json" : null,
    model.stream ? "stream" : null,
    model.reasoning ? "reasoning" : null,
  ].filter(Boolean) as PayModel["chips"];
}

export function isVideoModel(model: ApiModel) {
  return (
    model.model_type?.toLowerCase() === "video" ||
    model.modalities?.output?.includes("video") ||
    model.capabilities?.video_generation === true
  );
}

export function isAudioToTextModel(model: ApiModel) {
  return (
    model.model_type?.toLowerCase() === "audio_to_text" ||
    model.schema_endpoints?.includes("audio") === true
  );
}

export function getSinglePriceUnit(model: ApiModel) {
  const unit = model.pricing?.unit?.trim();
  if (unit) return unit;

  const pricingMode = model.pricing_mode?.toLowerCase();
  if (pricingMode === "second") return "second";
  if (pricingMode === "image") return "image";

  return "unit";
}

export function formatUnit(unit: string) {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "seconds") return "second";
  return unit;
}

export function getSinglePriceLabel(model: ApiModel, unit: string) {
  const normalizedUnit = unit.toLowerCase();
  const outputModalities = model.modalities?.output ?? [];

  if (
    normalizedUnit === "image" ||
    model.pricing_mode?.toLowerCase() === "image"
  ) {
    return "Image";
  }

  if (isAudioToTextModel(model)) return "Audio";

  if (
    normalizedUnit === "second" ||
    normalizedUnit === "seconds" ||
    model.pricing_mode?.toLowerCase() === "second" ||
    model.model_type?.toLowerCase() === "video" ||
    outputModalities.includes("video") ||
    model.capabilities?.video_generation === true
  ) {
    return "Video";
  }

  return "Price";
}

export function pricingItems(model: ApiModel): PayModel["priceItems"] {
  const pricingMode = model.pricing_mode?.toLowerCase();
  const unit = model.pricing?.unit?.trim() || "1M tokens";
  const normalizedUnit = unit.toLowerCase();
  const hasSinglePrice = typeof model.pricing?.price === "number";
  const hasTokenPair =
    typeof model.pricing?.input === "number" ||
    typeof model.pricing?.output === "number";
  const isSinglePrice =
    pricingMode === "image" ||
    pricingMode === "second" ||
    normalizedUnit === "image" ||
    normalizedUnit === "second" ||
    normalizedUnit === "seconds" ||
    (hasSinglePrice && !hasTokenPair);

  const cacheItems = cachePriceEntries(model.pricing).map((entry) => ({
    label: entry.label,
    value: `${formatUsd(Number(entry.value))} / ${unit}`,
  }));

  if (isProviderQuoteModel(model)) {
    return [
      { label: "Dynamic pricing", value: providerQuotePriceLabel(model.id) },
    ];
  }

  const startingPrice = isVideoModel(model)
    ? startingVideoPrice(model.pricing)
    : null;
  if (startingPrice) {
    return [
      {
        label: "Video",
        value: `From ${formatUsd(Number(startingPrice))} / second`,
      },
    ];
  }

  // Per-second audio prices round to $0.00 at display precision, so show minutes.
  if (
    isAudioToTextModel(model) &&
    typeof model.pricing?.price === "number" &&
    formatUnit(getSinglePriceUnit(model)).toLowerCase() === "second"
  ) {
    return [
      { label: "Audio", value: `${formatUsd(model.pricing.price * 60)} / minute` },
    ];
  }

  if (isSinglePrice) {
    const singleUnit = getSinglePriceUnit(model);

    return [
      {
        label: getSinglePriceLabel(model, singleUnit),
        value: `${formatUsd(model.pricing?.price)} / ${formatUnit(singleUnit)}`,
      },
      ...cacheItems,
    ];
  }

  return [
    { label: "Input", value: `${formatUsd(model.pricing?.input)} / ${unit}` },
    { label: "Output", value: `${formatUsd(model.pricing?.output)} / ${unit}` },
    ...cacheItems,
  ];
}

export function transformApiModel(model: ApiModel): PayModel {
  const provider = logoDetailsForModelId(model.id) ?? { provider: "" };
  const providerQuote = isProviderQuoteModel(model);
  const hasVideoPricing =
    !providerQuote &&
    isVideoModel(model) &&
    videoPriceOptions(model.pricing).length > 0;

  return {
    id: model.id,
    name: model.id,
    ...provider,
    tier: model.tier,
    chips: modelChips(model),
    contextWindow: formatContextWindow(model),
    priceItems: pricingItems(model),
    providerQuote,
    providerQuoteHasTypical: Boolean(providerQuoteTypical(model.id)),
    videoPricing: hasVideoPricing ? model.pricing : undefined,
    minimumRequestPrice:
      typeof model.pricing?.minimum_request_price_usd === "number"
        ? formatUsd(model.pricing.minimum_request_price_usd)
        : undefined,
    usageBasedOnly: model.usage_based_only,
    availabilityLastHourPercent:
      typeof model.availability_last_hour_percent === "number" &&
      Number.isFinite(model.availability_last_hour_percent)
        ? model.availability_last_hour_percent
        : undefined,
    availability: model.availability,
  };
}

export function modelProviderName(model: PayModel) {
  return model.provider || "Other";
}

export function providerSortRank(provider: string) {
  const normalizedProvider = provider.toLowerCase();

  if (normalizedProvider === "deepseek") return 1;
  if (normalizedProvider === "qwen") return 2;

  return 3;
}

export function sortModelsByProvider(models: PayModel[]) {
  return [...models].sort((a, b) => {
    const aIsGpt55 = a.id.toLowerCase().startsWith("gpt-5.5");
    const bIsGpt55 = b.id.toLowerCase().startsWith("gpt-5.5");

    if (aIsGpt55 !== bIsGpt55) return aIsGpt55 ? -1 : 1;

    const aProvider = modelProviderName(a);
    const bProvider = modelProviderName(b);
    const providerRankDiff =
      providerSortRank(aProvider) - providerSortRank(bProvider);

    if (providerRankDiff !== 0) return providerRankDiff;

    const providerNameDiff = aProvider.localeCompare(bProvider, undefined, {
      sensitivity: "base",
    });
    if (providerNameDiff !== 0) return providerNameDiff;

    return a.id.localeCompare(b.id, undefined, { sensitivity: "base" });
  });
}
