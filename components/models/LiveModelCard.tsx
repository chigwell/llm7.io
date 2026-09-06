"use client";
import Image from "next/image";
import { useCallback, useState } from "react";
import VideoPricingBreakdown from "./VideoPricingBreakdown";
import type { PayModel } from "@/lib/models/live-pricing";
import { cn } from "@/lib/utils";

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

export function ModelCard({ model, availability }: { model: PayModel; availability?: number }) {
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

      {model.videoPricing ? <VideoPricingBreakdown pricing={model.videoPricing} compact /> : null}
      {model.providerQuote ? <p className="mt-2 text-xs text-muted-foreground">{model.providerQuoteHasTypical ? "Recent reference for a 720p image-to-video request. " : ""}Billed at actual provider cost with no LLM7 markup; the final charge varies with request parameters and provider usage.</p> : null}

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

