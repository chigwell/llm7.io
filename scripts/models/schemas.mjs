import { z } from "zod";
import {
  DECIMAL_STRING as DECIMAL,
  DENIED_PUBLIC_KEYS as DENIED,
  NonNegativeNumber as nonNegative,
  NullableNonNegativeNumber as nullableNonNegative,
  Rate as rate,
  PaginationSchema as pagination,
} from "../../lib/models/schema-primitives.js";

// CLI validation deliberately preserves its existing messages and acceptance policy.
const timestamp = z
  .string()
  .refine(
    (value) =>
      Number.isFinite(Date.parse(value)) &&
      Date.parse(value) <= Date.now() + 10 * 60_000,
    "invalid timestamp",
  );
const decimal = z.string().regex(DECIMAL, "invalid decimal string");
const cachePricing = z.object({
  cached_input: decimal.optional(),
  cached_output: decimal.optional(),
  cache_read: decimal.optional(),
  cache_write: decimal.optional(),
});
const videoPriceTier = z
  .object({
    resolution: z.string().optional(),
    size: z.string().optional(),
    quality: z.string().optional(),
    sound: z.boolean().optional(),
    billing_strategy: z.literal("provider_quote").optional(),
    static_price_role: z.literal("catalog_fallback").optional(),
    public_price_usd_per_second: decimal.optional(),
  })
  .passthrough();
const videoRoutePrice = z.object({
  request_type: z.string().optional(),
  billing_strategy: z.literal("provider_quote").optional(),
  static_price_role: z.literal("catalog_fallback").optional(),
  public_price_usd_per_second: decimal.optional(),
  price_tiers_usd_per_second: z.array(videoPriceTier).optional(),
});
const pricing = z
  .object({
    mode: z.enum(["token", "image", "second"]),
    currency: z.string().min(1),
    unit: z.string().min(1),
    minimum_request_usd: decimal.nullable().optional(),
    input: decimal.optional(),
    output: decimal.optional(),
    price: decimal.optional(),
    billing_strategy: z.literal("provider_quote").optional(),
    static_price_role: z.literal("catalog_fallback").optional(),
    cached_input: decimal.optional(),
    cached_output: decimal.optional(),
    cache_read: decimal.optional(),
    cache_write: decimal.optional(),
    public_price_usd_per_million: cachePricing.optional(),
    route_prices_usd_per_second: z.array(videoRoutePrice).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "token" && (!value.input || !value.output))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "token prices require input and output",
      });
    if (value.mode !== "token" && !value.price)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "unit price required",
      });
  });
const statistics = z.object({
  window: z.string(),
  requests_total: nonNegative,
  upstream_attempts: nonNegative,
  successful_requests: nonNegative,
  client_errors_4xx: nonNegative,
  server_errors_5xx: nonNegative,
  timeouts: nonNegative,
  rate_limited_429: nonNegative,
  cancelled_requests: nonNegative,
  success_rate: rate,
  input_tokens: nonNegative,
  output_tokens: nonNegative,
  images_generated: nonNegative,
  videos_generated: nonNegative,
  video_seconds_generated: decimal,
  jobs_started: nonNegative,
  jobs_succeeded: nonNegative,
  jobs_failed: nonNegative,
  jobs_cancelled: nonNegative,
  job_success_rate: rate,
  latency_observations: nonNegative,
  latency_avg_ms: nullableNonNegative,
  latency_p50_ms: nullableNonNegative,
  latency_p95_ms: nullableNonNegative,
  ttft_observations: nonNegative,
  ttft_avg_ms: nullableNonNegative,
  ttft_p50_ms: nullableNonNegative,
  ttft_p95_ms: nullableNonNegative,
  first_bucket: timestamp.nullable(),
  last_bucket: timestamp.nullable(),
});
const apiInterface = z.object({
  path: z.string().startsWith("/"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  schema: z.string().min(1),
  docs_url: z.string().url().nullable(),
  operation: z.string().min(1),
  asynchronous: z.boolean(),
});
const modelCore = z
  .object({
    model_id: z.string().min(1),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .refine((slug) => !slug.includes("--")),
    display_name: z.string().min(1),
    status: z.enum(["active", "retired"]),
    model_type: z.enum(["chat", "systemone", "image", "video", "audio_to_text"]),
    tier: z.string().nullable().optional(),
    pricing,
    context_window: z.object({
      tokens: nullableNonNegative,
      chars: nullableNonNegative,
    }),
    modalities: z.object({
      input: z.array(z.string()),
      output: z.array(z.string()),
    }),
    capabilities: z
      .object({
        tools: z.boolean().nullable().optional(),
        stream: z.boolean().nullable().optional(),
        vision: z.boolean().nullable().optional(),
        json_mode: z.boolean().nullable().optional(),
        reasoning: z.boolean().nullable().optional(),
        image_generation: z.boolean().nullable().optional(),
        image_edits: z.boolean().nullable().optional(),
        video_generation: z.boolean().nullable().optional(),
        video_async: z.boolean().nullable().optional(),
        max_reference_images: nullableNonNegative.optional(),
        max_reference_image_bytes: nullableNonNegative.optional(),
        supported_sizes: z.array(z.string()).optional(),
        supported_seconds: z.array(nonNegative).optional(),
        requires_reference_image: z.boolean().nullable().optional(),
      })
      .passthrough(),
    schema_endpoints: z.array(z.string()),
    api_interfaces: z.array(apiInterface).min(1),
    usage_based_only: z.boolean().nullable().optional(),
    stream: z.boolean().nullable().optional(),
    json_mode: z.boolean().nullable().optional(),
    reasoning: z.boolean().nullable().optional(),
    tools_calling: z.boolean().nullable().optional(),
    source_created_at: timestamp.nullable().optional(),
    first_seen_at: timestamp.optional(),
    updated_at: timestamp.optional(),
  })
  .passthrough();
export const listResponse = z.object({
  data: z.array(
    modelCore.extend({
      statistics,
      first_seen_at: timestamp,
      updated_at: timestamp,
    }),
  ),
  pagination,
  catalog_version: z.string().min(1),
  catalog_updated_at: timestamp,
  metrics_snapshot_at: timestamp.nullable(),
});
export const detailResponse = modelCore.extend({
  first_seen_at: timestamp,
  updated_at: timestamp,
  statistics: z.record(statistics).optional(),
  data_available_from: timestamp.nullable().optional(),
  latest_metrics_bucket: timestamp.nullable().optional(),
  related_models: z.array(modelCore).optional(),
});
const metricPoint = statistics
  .omit({ window: true, first_bucket: true, last_bucket: true })
  .extend({ bucket_start: timestamp });
export const metricsResponse = z.object({
  range: z.string(),
  interval: z.string(),
  points: z.array(metricPoint),
  sample_size: nonNegative,
  data_available_from: timestamp.nullable(),
  latest_complete_bucket: timestamp.nullable(),
  generated_at: timestamp,
});
export const summaryResponse = z.object({
  range: z.string(),
  models: z.object({
    total: nonNegative,
    active: nonNegative,
    retired: nonNegative,
    chat: nonNegative,
    systemone: nonNegative.optional(),
    audio_to_text: nonNegative.optional(),
    image: nonNegative,
    video: nonNegative,
    models_with_requests: nonNegative,
  }),
  requests: z.object({
    total: nonNegative,
    successful: nonNegative,
    client_errors_4xx: nonNegative,
    server_errors_5xx: nonNegative,
    timeouts: nonNegative,
    rate_limited_429: nonNegative,
    cancelled: nonNegative,
    success_rate: rate,
  }),
  usage: z.object({
    input_tokens: nonNegative,
    output_tokens: nonNegative,
    images_generated: nonNegative,
    videos_generated: nonNegative,
    video_seconds_generated: decimal,
  }),
  jobs: z.object({
    started: nonNegative,
    succeeded: nonNegative,
    failed: nonNegative,
    cancelled: nonNegative,
    success_rate: rate,
  }),
  latency: z.object({
    observations: nonNegative,
    average_ms: nullableNonNegative,
    p50_ms: nullableNonNegative,
    p95_ms: nullableNonNegative,
  }),
  data_available_from: timestamp.nullable(),
  latest_complete_bucket: timestamp.nullable(),
  generated_at: timestamp,
});
export const versionResponse = z.object({
  schema_version: z.number().int().positive(),
  catalog_version: z.string().min(1),
  catalog_updated_at: timestamp,
  latest_metrics_bucket: timestamp.nullable(),
});
export const liveVideoPricingResponse = z.object({
  data: z.array(
    z.object({
      id: z.string().min(1),
      pricing: z.object({
        route_prices_usd_per_second: z.array(videoRoutePrice).optional(),
      }),
    }),
  ),
});

export function assertNoDeniedFields(value, path = "public") {
  if (Array.isArray(value))
    return value.forEach((entry, index) =>
      assertNoDeniedFields(entry, `${path}[${index}]`),
    );
  if (value && typeof value === "object")
    for (const [key, entry] of Object.entries(value)) {
      if (DENIED.test(key))
        throw new Error(`Provider-related field rejected: ${path}.${key}`);
      assertNoDeniedFields(entry, `${path}.${key}`);
    }
}

export function stripInternalRouteFields(value) {
  if (Array.isArray(value)) return value.map(stripInternalRouteFields);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      if (key === "atlascloud_routes") return [];
      return [[key, stripInternalRouteFields(entry)]];
    }),
  );
}

export function validate(schema, value, label) {
  const parsed = stripInternalRouteFields(schema.parse(value));
  assertNoDeniedFields(parsed, label);
  return parsed;
}
