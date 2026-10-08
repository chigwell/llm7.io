"use client";

import { useLivePrices } from "@/hooks/use-llm7-models";
import { liveModelsStore, MODELS_API_URL, type LiveModelsSnapshot } from "@/lib/models/live-models-store";
import type { CurrentPricing } from "@/lib/models/current-pricing";
import { formatCachePrice, formatPrice, formatUsd, pricesDirectlyComparable } from "@/lib/models/format";
import { isProviderQuoteModel, startingVideoPrice } from "@/lib/models/video-pricing";
import ModelCalculator from "./ModelCalculator.client";
import ProviderQuotePricing from "./ProviderQuotePricing";
import VideoPricingBreakdown from "./VideoPricingBreakdown";

export function PricingStatus({ state, retry = true }: { state: LiveModelsSnapshot["state"]; retry?: boolean }) {
  return <div className="text-sm text-muted-foreground" role="status">
    {state === "loading" ? "Checking current pricing…" : state === "error" ? "Current pricing could not be verified. Estimates are unavailable until prices refresh." : "No current price is published for this model."}
    {state === "error" && retry ? <button type="button" className="ml-2 underline underline-offset-4" onClick={() => void liveModelsStore.refresh(true)}>Retry pricing</button> : null}
    <noscript> Enable JavaScript to view live prices, or <a className="underline" href={MODELS_API_URL}>check the pricing API</a>.</noscript>
  </div>;
}

export function PriceDetails({ model, compact = false }: { model: CurrentPricing; compact?: boolean }) {
  const quote = isProviderQuoteModel(model);
  const cache = formatCachePrice(model);
  return <div data-live-price={model.model_id}>
    <p className={compact ? "text-sm font-medium" : "text-lg font-medium"}>{quote ? "Dynamic per-request quote" : formatPrice(model)}</p>
    {model.model_type === "video" && !quote ? <VideoPricingBreakdown pricing={model.pricing} compact={compact} /> : null}
    {quote ? <p className="mt-2 text-xs text-muted-foreground">Billed at actual provider cost with no LLM7 markup.</p> : null}
    {!quote && cache ? <p className="mt-2 text-sm text-muted-foreground">Cache pricing: {cache}.</p> : null}
    {model.pricing.minimum_request_usd != null ? <p className="mt-2 text-sm text-muted-foreground">Minimum charge per request: {formatUsd(model.pricing.minimum_request_usd)}.</p> : null}
  </div>;
}

export function LivePrice({ modelId, compact = true }: { modelId: string; compact?: boolean }) {
  const { prices, state } = useLivePrices();
  const model = prices.get(modelId);
  return model ? <PriceDetails model={model} compact={compact} /> : <PricingStatus state={state} retry={false} />;
}

export default function LiveModelPricing({ modelId, showPrice = true, showCalculator = true }: { modelId: string; showPrice?: boolean; showCalculator?: boolean }) {
  const { prices, state } = useLivePrices();
  const model = prices.get(modelId);
  const pricing = model?.pricing;
  return <>
    {showPrice ? <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Current LLM7 pricing</p><h2 className="mt-2 text-2xl font-semibold">Simple, pay-as-you-go pricing</h2></div>{pricing ? <span className="rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium">{pricing.unit}</span> : null}</div>
      <div className="mt-4">{model ? <PriceDetails model={model} /> : <PricingStatus state={state} />}</div>
    </section> : null}
    {showCalculator && model && pricing ? isProviderQuoteModel(model)
      ? <ProviderQuotePricing modelId={modelId} />
      : <ModelCalculator key={`${modelId}:${pricing.mode}:${pricing.unit}`} mode={pricing.mode} unit={pricing.unit} inputPrice={pricing.input} outputPrice={pricing.output} price={startingVideoPrice(pricing) ?? pricing.price} minimum={pricing.minimum_request_usd} durations={model.capabilities.supported_seconds} audio={model.model_type === "audio_to_text"} variablePricing={Boolean(pricing.route_prices_usd_per_second?.length)} />
      : showCalculator && !showPrice ? <PricingStatus state={state} /> : null}
  </>;
}

export function LivePriceComparison({ leftId, rightId }: { leftId: string; rightId: string }) {
  const { prices } = useLivePrices();
  const left = prices.get(leftId), right = prices.get(rightId);
  if (!left || !right) return null;
  return <p className="text-sm text-muted-foreground">{pricesDirectlyComparable(left, right)
    ? "Prices use the same billing mode, currency, and unit; compare the current rates above."
    : "Prices are not directly comparable; units, billing modes, or per-request quotes differ."}</p>;
}

export function LiveComparisonPricing({ leftId, rightId }: { leftId: string; rightId: string }) {
  return <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur md:p-6">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Current pricing</p><h2 className="mt-2 text-2xl font-semibold">See the cost difference clearly</h2>
    <div className="mt-5 grid gap-3 md:grid-cols-2">{[leftId, rightId].map(modelId => <article key={modelId} className="rounded-2xl border border-border/60 bg-background/45 p-4"><p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{modelId}</p><LivePrice modelId={modelId} compact={false} /></article>)}</div>
    <div className="mt-3"><LivePriceComparison leftId={leftId} rightId={rightId} /></div>
  </section>;
}
