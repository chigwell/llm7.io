import type { Metadata } from "next";
import Link from "next/link";
import TokenBudgetCalculator, { type CachedInputPriceKey, type TokenBudgetModel } from "@/components/models/TokenBudgetCalculator.client";
import { JsonLd, SeoFooter, SeoNavigation } from "@/components/models/SeoChrome";
import { cachePriceEntries, parseTokenPricingUnit } from "@/lib/models/format";
import { logoDetailsForModelId } from "@/lib/models/logos";
import { publicModels } from "@/lib/models/snapshot";
import { siteStructuredData } from "@/lib/models/structured-data";

const PRICING_REFERENCE_URL = "https://api.llm7.io/v1/models";

export const metadata: Metadata = {
  title: "LLM7 Token Budget Calculator | Estimate Tokens by USD",
  description: "Enter a USD budget and estimate approximate input, cached input, output, and total text tokens across active LLM7 token-priced models.",
  alternates: { canonical: "https://llm7.io/token-calculator/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "LLM7 Token Budget Calculator",
    description: "Estimate approximate token volume by USD budget across active LLM7 text models.",
    url: "https://llm7.io/token-calculator/",
    images: ["https://llm7.io/generated/og/model-comparison.png"],
  },
  twitter: { card: "summary_large_image", images: ["https://llm7.io/generated/og/model-comparison.png"] },
};

type PricingReference = {
  inputPrice?: number;
  outputPrice?: number;
  cachedInputPrice?: number | null;
  cachePriceKey?: CachedInputPriceKey | null;
  minimumCacheTokens?: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonNegativeNumber(value: unknown): number | null {
  const numeric = typeof value === "string" || typeof value === "number" ? Number(value) : NaN;
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function cachePriceFromPricing(pricing: Record<string, unknown>): Pick<PricingReference, "cachedInputPrice" | "cachePriceKey" | "minimumCacheTokens"> {
  const cachedInput = nonNegativeNumber(pricing.cached_input);
  const cacheRead = nonNegativeNumber(pricing.cache_read);

  return {
    cachedInputPrice: cachedInput ?? cacheRead,
    cachePriceKey: cachedInput !== null ? "cached_input" : cacheRead !== null ? "cache_read" : null,
    minimumCacheTokens: nonNegativeNumber(pricing.minimum_cache_tokens),
  };
}

async function pricingReferences(): Promise<Map<string, PricingReference>> {
  try {
    const response = await fetch(PRICING_REFERENCE_URL, { cache: "force-cache" });
    if (!response.ok) return new Map();

    const payload = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.data)) return new Map();

    return payload.data.reduce<Map<string, PricingReference>>((references, item) => {
      if (!isRecord(item) || typeof item.id !== "string" || !isRecord(item.pricing)) return references;

      references.set(item.id, {
        inputPrice: nonNegativeNumber(item.pricing.input) ?? undefined,
        outputPrice: nonNegativeNumber(item.pricing.output) ?? undefined,
        ...cachePriceFromPricing(item.pricing),
      });

      return references;
    }, new Map());
  } catch {
    return new Map();
  }
}

function textBudgetModels(referencePrices: Map<string, PricingReference>): TokenBudgetModel[] {
  return publicModels
    .filter((model) => {
      return (
        model.status === "active" &&
        model.pricing.mode === "token" &&
        model.modalities.input.includes("text") &&
        model.modalities.output.includes("text") &&
        Number(model.pricing.input) > 0 &&
        Number(model.pricing.output) > 0
      );
    })
    .map((model) => {
      const tokensPerUnit = parseTokenPricingUnit(model.pricing.unit);
      const logo = logoDetailsForModelId(model.model_id);
      const referencePrice = referencePrices.get(model.model_id);
      const cacheEntry = cachePriceEntries(model.pricing).find((entry) => entry.key === "cached_input" || entry.key === "cache_read");
      const fallbackCachePrice = cacheEntry ? Number(cacheEntry.value) : null;
      const fallbackCacheKey = cacheEntry?.key === "cached_input" || cacheEntry?.key === "cache_read" ? cacheEntry.key : null;

      return {
        modelId: model.model_id,
        slug: model.slug,
        displayName: model.display_name,
        tier: model.tier,
        provider: logo?.provider,
        lightLogo: logo?.lightLogo,
        darkLogo: logo?.darkLogo,
        invertLogo: logo?.invert,
        contextTokens: model.context_window.tokens,
        inputPrice: referencePrice?.inputPrice ?? Number(model.pricing.input),
        outputPrice: referencePrice?.outputPrice ?? Number(model.pricing.output),
        cachedInputPrice: referencePrice?.cachedInputPrice ?? fallbackCachePrice,
        cachePriceKey: referencePrice?.cachePriceKey ?? fallbackCacheKey,
        minimumCacheTokens: referencePrice?.minimumCacheTokens ?? null,
        unit: model.pricing.unit,
        tokensPerUnit: Number(tokensPerUnit?.toString() ?? 1_000_000),
      };
    })
    .sort((left, right) => left.modelId.localeCompare(right.modelId, undefined, { sensitivity: "base" }));
}

export default async function TokenCalculatorPage() {
  const models = textBudgetModels(await pricingReferences());

  return (
    <>
      <SeoNavigation />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-6">
        <JsonLd data={siteStructuredData()} />
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
          <Link className="transition-colors hover:text-foreground" href="/">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Token calculator</span>
        </nav>

        <header className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/55 to-primary/5 p-6 shadow-sm backdrop-blur md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Token budget calculator</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Estimate text tokens from a dollar amount.</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Compare how far the same budget goes across LLM7 text models, with approximate input/output and cached-token splits applied per model.
          </p>
        </header>

        <TokenBudgetCalculator models={models} />
      </main>
      <SeoFooter />
    </>
  );
}
