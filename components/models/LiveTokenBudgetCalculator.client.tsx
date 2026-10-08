"use client";

import { useMemo } from "react";
import { useLivePrices } from "@/hooks/use-llm7-models";
import type { PublicModel } from "@/lib/models/api-types";
import { cachePriceEntries, parseTokenPricingUnit } from "@/lib/models/format";
import { logoDetailsForModelId } from "@/lib/models/logos";
import { PricingStatus } from "./LiveModelPricing.client";
import TokenBudgetCalculator, { type TokenBudgetModel } from "./TokenBudgetCalculator.client";

export default function LiveTokenBudgetCalculator({ models: catalogue }: { models: PublicModel[] }) {
  const { prices, state } = useLivePrices();
  const models = useMemo(() => catalogue.flatMap((model): TokenBudgetModel[] => {
    const live = prices.get(model.model_id);
    if (!live || live.pricing.mode !== "token" || live.pricing.billing_strategy === "provider_quote") return [];
    const tokens = parseTokenPricingUnit(live.pricing.unit);
    const input = Number(live.pricing.input), output = Number(live.pricing.output);
    if (!tokens?.gt(0) || !Number.isFinite(input + output) || input + output <= 0) return [];
    const logo = logoDetailsForModelId(model.model_id);
    const cache = cachePriceEntries(live.pricing).find(entry => entry.key === "cached_input" || entry.key === "cache_read");
    return [{
      modelId: model.model_id, slug: model.slug, displayName: model.display_name,
      tier: model.tier, provider: logo?.provider, lightLogo: logo?.lightLogo,
      darkLogo: logo?.darkLogo, invertLogo: logo?.invert, contextTokens: model.context_window.tokens,
      inputPrice: input, outputPrice: output,
      cachedInputPrice: cache ? Number(cache.value) : null,
      cachePriceKey: cache?.key === "cached_input" || cache?.key === "cache_read" ? cache.key : null,
      minimumCacheTokens: live.minimumCacheTokens,
      unit: live.pricing.unit, tokensPerUnit: Number(tokens.toString()),
    }];
  }), [catalogue, prices]);
  return <>
    <div className="mt-8">{state !== "ready" ? <PricingStatus state={state} /> : <p className="text-sm text-muted-foreground">Estimates use current API prices. Models without a verified token price are excluded. Minimum request charges, retries, and taxes are not included.</p>}</div>
    <TokenBudgetCalculator models={models} />
  </>;
}
