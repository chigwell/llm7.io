export type VideoPriceValue = string | number;

export type VideoPriceTier = {
  resolution?: string;
  size?: string;
  quality?: string;
  sound?: boolean;
  public_price_usd_per_second?: VideoPriceValue;
  [key: string]: unknown;
};

export type VideoRoutePrice = {
  request_type?: string;
  public_price_usd_per_second?: VideoPriceValue;
  price_tiers_usd_per_second?: VideoPriceTier[];
};

export type VideoPricing = {
  route_prices_usd_per_second?: VideoRoutePrice[];
};

export type VideoPriceOption = {
  label: string;
  price: string;
};

type FlatVideoRate = {
  requestLabel: string;
  resolution?: string;
  features: string[];
  price: string;
};

const NON_FEATURE_KEYS = new Set([
  "public_price_usd_per_second",
  "resolution",
  "size",
  "quality",
  "sound",
]);

function priceValue(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return String(value);
  if (typeof value === "string" && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return value;
  return null;
}

function words(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function requestLabel(requestType?: string): string {
  const source = requestType?.toLowerCase().replace(/-to-video$/, "");
  if (source === "text") return "Text prompt";
  if (source === "image") return "Image reference";
  if (source === "video") return "Video reference";
  if (source === "audio") return "Audio reference";
  if (source === "reference") return "Reference media";
  return source ? words(source) : "Video generation";
}

function featureLabel(key: string, value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const label = words(key);
  if (typeof value === "boolean") return `${label} ${value ? "on" : "off"}`;
  if (typeof value === "string" || typeof value === "number") return `${label}: ${value}`;
  return null;
}

function tierFeatures(tier: VideoPriceTier): string[] {
  const features = [
    tier.quality ? words(tier.quality) : null,
    typeof tier.sound === "boolean" ? `Audio ${tier.sound ? "on" : "off"}` : null,
    ...Object.entries(tier)
      .filter(([key]) => !NON_FEATURE_KEYS.has(key))
      .map(([key, value]) => featureLabel(key, value)),
  ];

  return features.filter((feature): feature is string => Boolean(feature));
}

function flattenVideoRates(pricing: VideoPricing | null | undefined): FlatVideoRate[] {
  return (pricing?.route_prices_usd_per_second ?? []).flatMap((route) => {
    const tiers = route.price_tiers_usd_per_second ?? [];
    if (!tiers.length) {
      const price = priceValue(route.public_price_usd_per_second);
      return price ? [{ requestLabel: requestLabel(route.request_type), resolution: undefined, features: [], price }] : [];
    }

    return tiers.flatMap((tier) => {
      const price = priceValue(tier.public_price_usd_per_second ?? route.public_price_usd_per_second);
      if (!price) return [];

      return [{
        requestLabel: requestLabel(route.request_type),
        resolution: tier.resolution ?? tier.size,
        features: tierFeatures(tier),
        price,
      }];
    });
  });
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function videoPriceOptions(pricing: VideoPricing | null | undefined): VideoPriceOption[] {
  const rates = flattenVideoRates(pricing);
  const byConfiguration = new Map<string, FlatVideoRate & { requestLabels: string[] }>();

  for (const rate of rates) {
    const key = [rate.price, rate.resolution ?? "", ...rate.features].join("|");
    const existing = byConfiguration.get(key);
    if (existing) existing.requestLabels = unique([...existing.requestLabels, rate.requestLabel]);
    else byConfiguration.set(key, { ...rate, requestLabels: [rate.requestLabel] });
  }

  const byResolution = new Map<string, { price: string; requestLabels: string[]; resolutions: string[]; features: string[] }>();
  for (const rate of byConfiguration.values()) {
    const requestLabels = [...rate.requestLabels].sort((left, right) => {
      const order = ["Text prompt", "Image reference", "Video reference", "Audio reference", "Reference media"];
      return (order.indexOf(left) === -1 ? order.length : order.indexOf(left)) - (order.indexOf(right) === -1 ? order.length : order.indexOf(right));
    });
    const key = [rate.price, [...requestLabels].sort().join("|"), ...rate.features].join("|");
    const existing = byResolution.get(key);
    const resolutions = rate.resolution ? [rate.resolution] : [];
    if (existing) existing.resolutions = unique([...existing.resolutions, ...resolutions]);
    else byResolution.set(key, { price: rate.price, requestLabels, resolutions, features: rate.features });
  }

  return [...byResolution.values()]
    .sort((left, right) => Number(left.price) - Number(right.price) || left.requestLabels.join().localeCompare(right.requestLabels.join()))
    .map((rate) => ({
      label: [rate.requestLabels.join(" / "), rate.resolutions.join(" / "), ...rate.features].filter(Boolean).join(" · "),
      price: rate.price,
    }));
}

export function startingVideoPrice(pricing: VideoPricing | null | undefined): string | null {
  const prices = videoPriceOptions(pricing).map((option) => option.price);
  return prices.length ? prices.reduce((minimum, price) => Number(price) < Number(minimum) ? price : minimum) : null;
}
