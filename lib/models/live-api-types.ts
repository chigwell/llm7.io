import type { VideoRoutePrice } from "./video-pricing";

export type ApiModel = {
  id: string;
  model_type?: string;
  tier?: string;
  pricing?: {
    input?: number;
    output?: number;
    price?: number;
    billing_strategy?: "provider_quote";
    static_price_role?: "catalog_fallback";
    cached_input?: number;
    cached_output?: number;
    cache_read?: number;
    cache_write?: number;
    public_price_usd_per_million?: {
      cached_input?: number;
      cached_output?: number;
      cache_read?: number;
      cache_write?: number;
    };
    minimum_request_price_usd?: number;
    route_prices_usd_per_second?: VideoRoutePrice[];
    currency?: string;
    unit?: string;
  };
  pricing_mode?: "token" | "image" | "second" | string;
  modalities?: {
    input?: string[];
    output?: string[];
  };
  schema_endpoints?: string[];
  capabilities?: {
    systemone?: boolean;
    atlascloud_video?: boolean;
    video_generation?: boolean;
    video_async?: boolean;
    typed_answers?: boolean;
    noul?: boolean;
    choice?: boolean;
    score?: boolean;
    confidence?: boolean;
    max_reference_images?: number;
    max_reference_image_bytes?: number;
    supported_seconds?: number[];
    supported_sizes?: string[];
    [key: string]: unknown;
  };
  context_window?: {
    tokens?: number | null;
    chars?: number | null;
  };
  usage_based_only?: boolean;
  stream?: boolean;
  json_mode?: boolean;
  reasoning?: boolean;
  tools_calling?: boolean;
  availability_last_hour_percent?: number;
  availability?: {
    old?: number;
    mid?: number;
    recent?: number;
  };
};

export type ApiModelsResponse = {
  object: "list";
  data: ApiModel[];
};
