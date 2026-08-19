import { providerQuotePriceLabel, providerQuoteTypical } from "@/lib/models/video-pricing";

export default function ProviderQuotePricing({ modelId, compact = false }: { modelId: string; compact?: boolean }) {
  const typical = providerQuoteTypical(modelId);
  const priceLabel = providerQuotePriceLabel(modelId);

  if (compact) {
    return <p className="mt-2 text-xs text-muted-foreground">{typical ? `Recent ${typical.resolution} ${typical.requestType} reference. ` : ""}Dynamic pricing; billed at actual provider cost with no LLM7 markup.</p>;
  }

  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm md:p-6">
      <h2 className="text-2xl font-semibold">{priceLabel}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{typical ? `Based on recent ${typical.resolution} ${typical.requestType} usage. ` : ""}Dynamic pricing: the final charge is determined by request parameters and actual provider usage. LLM7 charges the resulting provider cost with no markup.</p>
    </section>
  );
}
