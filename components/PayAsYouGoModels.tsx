"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/buttonShadcn";
import { MODELS_API_URL, type ApiModel, useLlm7Models } from "@/hooks/use-llm7-models";
import { usePingMetrics } from "@/hooks/use-ping-metrics";
import { logoDetailsForModelId } from "@/lib/models/logos";
import { cn } from "@/lib/utils";

type PayModel = {
  id: string;
  name: string;
  provider: string;
  lightLogo?: string;
  darkLogo?: string;
  tier?: string;
  chips: Array<"tools" | "vision" | "video" | "json" | "stream" | "reasoning">;
  contextWindow: string;
  priceItems: Array<{
    label: string;
    value: string;
  }>;
  minimumRequestPrice?: string;
  usageBasedOnly?: boolean;
  availabilityLastHourPercent?: number;
  availability?: {
    old?: number;
    mid?: number;
    recent?: number;
  };
};

function formatUsd(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "n/a";

  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

function formatContextWindow(model: ApiModel) {
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

function modelChips(model: ApiModel): PayModel["chips"] {
  const outputModalities = model.modalities?.output ?? [];
  const isVideoModel =
    model.model_type?.toLowerCase() === "video" ||
    outputModalities.includes("video") ||
    model.capabilities?.video_generation === true;

  return [
    model.tools_calling ? "tools" : null,
    model.modalities?.input?.includes("image") ? "vision" : null,
    isVideoModel ? "video" : null,
    model.json_mode ? "json" : null,
    model.stream ? "stream" : null,
    model.reasoning ? "reasoning" : null,
  ].filter(Boolean) as PayModel["chips"];
}

function getSinglePriceUnit(model: ApiModel) {
  const unit = model.pricing?.unit?.trim();
  if (unit) return unit;

  const pricingMode = model.pricing_mode?.toLowerCase();
  if (pricingMode === "second") return "second";
  if (pricingMode === "image") return "image";

  return "unit";
}

function formatUnit(unit: string) {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "seconds") return "second";
  return unit;
}

function getSinglePriceLabel(model: ApiModel, unit: string) {
  const normalizedUnit = unit.toLowerCase();
  const outputModalities = model.modalities?.output ?? [];

  if (normalizedUnit === "image" || model.pricing_mode?.toLowerCase() === "image") {
    return "Image";
  }

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

function pricingItems(model: ApiModel): PayModel["priceItems"] {
  const pricingMode = model.pricing_mode?.toLowerCase();
  const unit = model.pricing?.unit?.trim() || "1M tokens";
  const normalizedUnit = unit.toLowerCase();
  const hasSinglePrice = typeof model.pricing?.price === "number";
  const hasTokenPair = typeof model.pricing?.input === "number" || typeof model.pricing?.output === "number";
  const isSinglePrice =
    pricingMode === "image" ||
    pricingMode === "second" ||
    normalizedUnit === "image" ||
    normalizedUnit === "second" ||
    normalizedUnit === "seconds" ||
    (hasSinglePrice && !hasTokenPair);

  if (isSinglePrice) {
    const singleUnit = getSinglePriceUnit(model);

    return [
      {
        label: getSinglePriceLabel(model, singleUnit),
        value: `${formatUsd(model.pricing?.price)} / ${formatUnit(singleUnit)}`,
      },
    ];
  }

  return [
    { label: "Input", value: `${formatUsd(model.pricing?.input)} / ${unit}` },
    { label: "Output", value: `${formatUsd(model.pricing?.output)} / ${unit}` },
  ];
}

function transformApiModel(model: ApiModel): PayModel {
  const provider = logoDetailsForModelId(model.id) ?? { provider: "" };

  return {
    id: model.id,
    name: model.id,
    ...provider,
    tier: model.tier,
    chips: modelChips(model),
    contextWindow: formatContextWindow(model),
    priceItems: pricingItems(model),
    minimumRequestPrice:
      typeof model.pricing?.minimum_request_price_usd === "number"
        ? formatUsd(model.pricing.minimum_request_price_usd)
        : undefined,
    usageBasedOnly: model.usage_based_only,
    availabilityLastHourPercent:
      typeof model.availability_last_hour_percent === "number" && Number.isFinite(model.availability_last_hour_percent)
        ? model.availability_last_hour_percent
        : undefined,
    availability: model.availability,
  };
}

function modelProviderName(model: PayModel) {
  return model.provider || "Other";
}

function providerSortRank(provider: string) {
  const normalizedProvider = provider.toLowerCase();

  if (normalizedProvider === "deepseek") return 1;
  if (normalizedProvider === "qwen") return 2;

  return 3;
}

function sortModelsByProvider(models: PayModel[]) {
  return [...models].sort((a, b) => {
    const aIsGpt55 = a.id.toLowerCase().startsWith("gpt-5.5");
    const bIsGpt55 = b.id.toLowerCase().startsWith("gpt-5.5");

    if (aIsGpt55 !== bIsGpt55) return aIsGpt55 ? -1 : 1;

    const aProvider = modelProviderName(a);
    const bProvider = modelProviderName(b);
    const providerRankDiff = providerSortRank(aProvider) - providerSortRank(bProvider);

    if (providerRankDiff !== 0) return providerRankDiff;

    const providerNameDiff = aProvider.localeCompare(bProvider, undefined, { sensitivity: "base" });
    if (providerNameDiff !== 0) return providerNameDiff;

    return a.id.localeCompare(b.id, undefined, { sensitivity: "base" });
  });
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function formatAvailabilityPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function getAvailabilityTone(availability?: number) {
  if (typeof availability !== "number") return "good";
  if (availability > 0.95) return "good";
  if (availability >= 0.7) return "warning";
  return "bad";
}

function ModelAvailabilityDot({ availability }: { availability?: number }) {
  const tone = getAvailabilityTone(availability);
  const label =
    typeof availability === "number"
      ? `Availability ${formatAvailabilityPercent(availability)} in the latest 60-second window`
      : "Availability currently healthy; no live model-specific attempts in the latest 60-second window";

  return (
    <span
      aria-label={label}
      title={label}
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full ring-2 ring-background",
        tone === "good" && "bg-emerald-500",
        tone === "warning" && "bg-amber-400",
        tone === "bad" && "bg-rose-500"
      )}
    />
  );
}

function getAvailabilityBarTone(percent: number) {
  if (percent > 95) return "good";
  if (percent >= 70) return "warning";
  return "bad";
}

function formatAvailabilityPercentValue(value: number): string {
  return `${Math.round(value)}%`;
}

function getFiniteAvailabilityPercent(value?: number, fallback?: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof fallback === "number" && Number.isFinite(fallback)) return fallback;
  return undefined;
}

function ModelAvailabilityBars({ model }: { model: PayModel }) {
  if (typeof model.availabilityLastHourPercent !== "number") return null;

  const fallback = model.availabilityLastHourPercent;
  const segments = [
    { key: "old", label: "Old", value: getFiniteAvailabilityPercent(model.availability?.old, fallback) },
    { key: "mid", label: "Mid", value: getFiniteAvailabilityPercent(model.availability?.mid, fallback) },
    { key: "recent", label: "Recent", value: getFiniteAvailabilityPercent(model.availability?.recent, fallback) },
  ];
  const label = `Last-hour availability ${formatAvailabilityPercentValue(model.availabilityLastHourPercent)}. ${segments
    .map((segment) => `${segment.label}: ${formatAvailabilityPercentValue(segment.value ?? fallback)}`)
    .join(", ")}`;

  return (
    <div aria-label={label} title={label} className="absolute bottom-4 right-4 flex h-4 items-end gap-0.5">
      {segments.map((segment) => {
        const value = segment.value ?? fallback;
        const tone = getAvailabilityBarTone(value);

        return (
          <span
            key={segment.key}
            className={cn(
              "block h-3 w-1 rounded-full",
              tone === "good" && "bg-emerald-500",
              tone === "warning" && "bg-amber-400",
              tone === "bad" && "bg-rose-500"
            )}
          />
        );
      })}
    </div>
  );
}

function ProviderLogo({ model }: { model: PayModel }) {
  const isOpenAi = model.provider.toLowerCase() === "openai";

  if (!model.lightLogo) {
    return null;
  }

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <Image
        src={model.lightLogo}
        alt={`${model.provider} logo`}
        width={30}
        height={30}
        className={cn(
          "max-h-7 w-auto object-contain",
          model.darkLogo && model.darkLogo !== model.lightLogo && "dark:hidden",
          isOpenAi && "dark:invert"
        )}
      />
      {model.darkLogo && model.darkLogo !== model.lightLogo ? (
        <Image
          src={model.darkLogo}
          alt={`${model.provider} logo`}
          width={30}
          height={30}
          className="hidden max-h-7 w-auto object-contain dark:block"
        />
      ) : null}
    </div>
  );
}

function ModelCard({ model, availability }: { model: PayModel; availability?: number }) {
  const [copied, setCopied] = useState(false);
  const hasContextWindow = model.contextWindow !== "Not listed";
  const hasSecondaryDetails = hasContextWindow || Boolean(model.minimumRequestPrice);

  const handleCopyTitle = useCallback(async () => {
    await copyToClipboard(model.name);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }, [model.name]);

  return (
    <article className="relative flex h-full flex-col rounded-xl border border-border/60 bg-card/55 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <ProviderLogo model={model} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="flex min-w-0 items-center gap-2 text-base font-semibold leading-6">
              <button
                type="button"
                onClick={handleCopyTitle}
                className="min-w-0 max-w-full truncate text-left underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                title={copied ? "Copied" : "Copy model name"}
              >
                {model.name}
              </button>
              <ModelAvailabilityDot availability={availability} />
            </h4>
            {model.tier ? (
              <span className="shrink-0 rounded-full border border-border/50 bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {model.tier}
              </span>
            ) : null}
          </div>
          {model.provider ? (
            <p className="text-xs text-muted-foreground">
              {model.provider}
              {copied ? <span className="ml-2 text-primary">Copied</span> : null}
            </p>
          ) : null}
        </div>
      </div>

      <div className={cn("mt-5 grid gap-2 text-sm", model.priceItems.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
        {model.priceItems.map((priceItem) => (
          <div key={priceItem.label} className="rounded-lg border border-border/50 bg-background/60 p-2">
            <div className="text-[11px] text-muted-foreground">{priceItem.label}</div>
            <div className="mt-1 text-xs font-semibold">{priceItem.value}</div>
          </div>
        ))}
      </div>

      {hasSecondaryDetails ? (
        <div className={cn("mt-3 grid gap-2 text-sm", hasContextWindow && model.minimumRequestPrice ? "grid-cols-2" : "grid-cols-1")}>
          {hasContextWindow ? (
            <div className="rounded-lg border border-border/50 bg-background/60 p-2">
              <div className="text-[11px] text-muted-foreground">Context</div>
              <div className="mt-1 text-xs font-semibold">{model.contextWindow}</div>
            </div>
          ) : null}
          {model.minimumRequestPrice ? (
            <div className="rounded-lg border border-border/50 bg-background/60 p-2">
              <div className="text-[11px] text-muted-foreground">Min request</div>
              <div className="mt-1 text-xs font-semibold">{model.minimumRequestPrice}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-1.5 pr-10">
        {model.chips.length > 0 ? (
          model.chips.map((chip) => (
            <span key={chip} className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium capitalize text-primary">
              {chip}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">Capabilities vary</span>
        )}
        {model.usageBasedOnly ? (
          <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">Usage only</span>
        ) : null}
      </div>
      <ModelAvailabilityBars model={model} />
    </article>
  );
}

export default function PayAsYouGoModels() {
  const [showAll, setShowAll] = useState(false);
  const { models: apiModels, modelsState } = useLlm7Models();
  const { latest: latestPingSnapshot } = usePingMetrics();

  const models = useMemo(() => apiModels.map(transformApiModel), [apiModels]);

  const visibleModels = useMemo(() => {
    const sortedModels = sortModelsByProvider(models);

    if (showAll) return sortedModels;

    return sortedModels.slice(0, 3);
  }, [models, showAll]);

  const hiddenCount = Math.max(models.length - visibleModels.length, 0);

  return (
    <section id="models" aria-labelledby="payg-heading" className="mx-auto w-full max-w-md scroll-mt-24 md:max-w-[61rem]">
      <div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Pay as you go</p>
          <h3 id="payg-heading" className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Scale frontier model access on your terms.
          </h3>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        {modelsState === "loading" ? "Loading current model pricing..." : null}
        {modelsState === "error" ? "Showing cached model pricing while live pricing is unavailable." : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {visibleModels.map((model) => {
          const availability = latestPingSnapshot?.modelAvailability[model.id.toLowerCase()];

          return <ModelCard key={model.id} model={model} availability={availability} />;
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Prices use each model&apos;s listed unit. Minimum request price is shown when provided by the model endpoint.{" "}
        <a href={MODELS_API_URL} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
          See all models in JSON format via API
        </a>
        .
      </p>

      {hiddenCount > 0 ? (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" onClick={() => setShowAll((value) => !value)}>
            {showAll ? (
              <>
                Show less <ChevronUpIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                Show all {models.length} models <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      ) : null}

      {showAll ? <div className="mt-4 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/models/">Browse the full model catalogue</Link>
        </Button>
      </div> : null}

    </section>
  );
}
