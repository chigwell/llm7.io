import Decimal from "decimal.js-light";
import type { PublicModel } from "./api-types";
import { isProviderQuoteModel, startingVideoPrice } from "./video-pricing";

export const CACHE_PRICE_KEYS = ["cached_input", "cached_output", "cache_read", "cache_write"] as const;

export type CachePriceKey = (typeof CACHE_PRICE_KEYS)[number];
type CachePriceValue = string | number | null | undefined;
type CachePriceContainer = Partial<Record<CachePriceKey, CachePriceValue>> & {
  public_price_usd_per_million?: Partial<Record<CachePriceKey, CachePriceValue>> | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCachePriceValue(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return String(value);
  if (typeof value === "string" && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return value;
  return null;
}

export function cachePriceEntries(pricing: CachePriceContainer | null | undefined): Array<{ key: CachePriceKey; label: CachePriceKey; value: string }> {
  if (!pricing) return [];

  const publicPrice = pricing.public_price_usd_per_million;
  const source = isRecord(publicPrice) ? publicPrice : pricing;

  return CACHE_PRICE_KEYS.flatMap((key) => {
    const value = normalizeCachePriceValue(source[key]);
    return value === null ? [] : [{ key, label: key, value }];
  });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)) + " UTC";
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "Not available" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function formatMs(value: number | null | undefined): string {
  return value === null || value === undefined ? "Not available" : `${formatNumber(value)} ms`;
}

export function formatRate(value: number | null | undefined): string {
  return value === null || value === undefined ? "Not available" : new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 }).format(value);
}

export function formatBoolean(value: boolean | null | undefined): string {
  return value === true ? "Supported" : value === false ? "Not supported" : "Not specified";
}

export function formatUsd(value: string | null | undefined): string {
  if (!value) return "Not available";
  return `$${new Decimal(value).toFixed(Math.min(Math.max(value.split(".")[1]?.length ?? 0, 2), 8))} USD`;
}

export function formatPrice(model: PublicModel): string {
  const { pricing } = model;
  if (isProviderQuoteModel(model)) return "Dynamic per-request quote";
  if (pricing.mode === "token") return `${formatUsd(pricing.input)} input and ${formatUsd(pricing.output)} output per ${pricing.unit}`;
  const startingPrice = pricing.mode === "second" ? startingVideoPrice(pricing) : null;
  if (startingPrice) return `From ${formatUsd(startingPrice)} per ${pricing.unit}`;
  return `${formatUsd(pricing.price)} per ${pricing.unit}`;
}

export function formatCachePrice(model: PublicModel): string | null {
  const entries = cachePriceEntries(model.pricing);
  if (!entries.length) return null;

  return `${entries.map((entry) => `${entry.label} ${formatUsd(entry.value)}`).join(" · ")} per ${model.pricing.unit}`;
}

export function formatContext(value: number | null | undefined, label = "tokens"): string {
  return value === null || value === undefined ? "Not specified" : `${new Intl.NumberFormat("en-US").format(value)} ${label}`;
}

export function parseTokenPricingUnit(unit: string): Decimal | null {
  const match = unit.trim().match(/^(\d+(?:\.\d+)?)\s*(k|m)?\s+tokens?$/i);
  if (!match) return null;
  const multiplier = match[2]?.toLowerCase() === "m" ? "1000000" : match[2]?.toLowerCase() === "k" ? "1000" : "1";
  return new Decimal(match[1]).times(multiplier);
}

export function pricesDirectlyComparable(left: PublicModel, right: PublicModel): boolean {
  if (isProviderQuoteModel(left) || isProviderQuoteModel(right)) return false;
  return left.pricing.currency === right.pricing.currency && left.pricing.mode === right.pricing.mode && left.pricing.unit === right.pricing.unit;
}

export function decimalDurationPrice(price: string, seconds: number): string {
  return new Decimal(price).times(new Decimal(seconds)).toFixed();
}
