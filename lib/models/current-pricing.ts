import Decimal from "decimal.js-light";
import { z } from "zod";
import type { PublicModel } from "./api-types";
import { parseTokenPricingUnit } from "./token-unit.js";

const decimal = z.union([
  z.number().finite().nonnegative(),
  z.string().max(100).regex(/^\d+(?:\.\d+)?$/),
]).transform(value => new Decimal(value).toFixed());
const cacheFields = {
  cached_input: decimal.optional(), cached_output: decimal.optional(),
  cache_read: decimal.optional(), cache_write: decimal.optional(),
};
const tier = z.object({
  resolution: z.string().optional(), size: z.string().optional(),
  quality: z.string().optional(), sound: z.boolean().optional(),
  public_price_usd_per_second: decimal.optional(),
});
const rates = z.array(z.object({
  request_type: z.string().optional(),
  public_price_usd_per_second: decimal.optional(),
  price_tiers_usd_per_second: z.array(tier).optional(),
}));
const liveModel = z.object({
  id: z.string().min(1),
  model_type: z.enum(["chat", "systemone", "image", "video", "audio_to_text"]),
  pricing_mode: z.enum(["token", "image", "second"]),
  pricing: z.object({
    currency: z.literal("USD"), unit: z.string().trim().min(1).max(80),
    input: decimal.optional(), output: decimal.optional(), price: decimal.optional(),
    ...cacheFields,
    public_price_usd_per_million: z.object(cacheFields).optional(),
    minimum_request_price_usd: decimal.nullable().optional(),
    minimum_request_usd: decimal.nullable().optional(),
    minimum_cache_tokens: z.number().finite().nonnegative().nullable().optional(),
    billing_strategy: z.literal("provider_quote").optional(),
    static_price_role: z.literal("catalog_fallback").optional(),
    route_prices_usd_per_second: rates.optional(),
  }),
  capabilities: z.object({
    atlascloud_video: z.boolean().optional(),
    supported_seconds: z.array(z.number().finite().positive()).optional(),
  }).optional(),
});

export type CurrentPricing = Pick<PublicModel, "model_id" | "model_type" | "pricing" | "capabilities"> & {
  minimumCacheTokens?: number | null;
};

/** Validate and replace the entire price record; never merge in build-time rates. */
export function currentPricing(value: unknown): CurrentPricing | null {
  const parsed = liveModel.safeParse(value);
  if (!parsed.success) return null;
  const model = parsed.data;
  const mode = model.pricing_mode;
  const { minimum_request_price_usd, minimum_cache_tokens, public_price_usd_per_million, ...price } = model.pricing;
  const quote = price.billing_strategy === "provider_quote" || model.capabilities?.atlascloud_video === true;
  const tokens = mode === "token" ? parseTokenPricingUnit(price.unit) : null;
  if (mode === "token" && (!tokens?.gt(0) || price.input === undefined || price.output === undefined)) return null;
  if (mode === "image" && !/^images?$/i.test(price.unit)) return null;
  if (mode === "second" && !/^seconds?$/i.test(price.unit)) return null;
  if (mode !== "token" && !quote && price.price === undefined) return null;
  if (price.route_prices_usd_per_second?.some(route => {
    const tiers = route.price_tiers_usd_per_second;
    return tiers?.length
      ? tiers.some(t => t.public_price_usd_per_second === undefined && route.public_price_usd_per_second === undefined)
      : route.public_price_usd_per_second === undefined;
  }) && !quote) return null;
  if (public_price_usd_per_million && tokens) {
    // This optional container is always per million, even when the base unit differs.
    for (const key of Object.keys(cacheFields) as Array<keyof typeof cacheFields>) {
      const value = public_price_usd_per_million[key];
      delete price[key];
      if (value !== undefined) price[key] = new Decimal(value).times(tokens).div(1_000_000).toFixed();
    }
  }
  return {
    model_id: model.id, model_type: model.model_type,
    capabilities: model.capabilities ?? {},
    pricing: { ...price, mode, minimum_request_usd: minimum_request_price_usd !== undefined ? minimum_request_price_usd : price.minimum_request_usd, ...(quote ? { billing_strategy: "provider_quote" as const } : {}) },
    minimumCacheTokens: minimum_cache_tokens,
  };
}

/** Static metadata may cross the client boundary; frozen monetary amounts may not. */
export function withoutSnapshotPrices(model: PublicModel): PublicModel {
  return { ...model, pricing: { mode: model.pricing.mode, currency: model.pricing.currency, unit: model.pricing.unit } };
}

export function withCurrentPricing(model: PublicModel, price?: CurrentPricing): PublicModel {
  return price
    ? { ...model, pricing: price.pricing, capabilities: { ...model.capabilities, ...price.capabilities, atlascloud_video: price.pricing.billing_strategy === "provider_quote" } }
    : withoutSnapshotPrices(model);
}
