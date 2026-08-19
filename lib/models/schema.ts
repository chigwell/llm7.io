import { z } from "zod";

export const DECIMAL_STRING = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const TIMESTAMP_SKEW_MS = 10 * 60 * 1000;

export function isNonNegativeDecimal(value: unknown): value is string {
  return typeof value === "string" && DECIMAL_STRING.test(value);
}

export function isSafeTimestamp(value: string): boolean {
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) && milliseconds <= Date.now() + TIMESTAMP_SKEW_MS;
}

const DecimalString = z.string().refine(isNonNegativeDecimal, "Expected a non-negative decimal string");
const Timestamp = z.string().refine(isSafeTimestamp, "Expected a valid timestamp that is not materially in the future");
const NullableBoolean = z.boolean().nullable().optional();
const NonNegativeNumber = z.number().finite().nonnegative();
const NullableNonNegativeNumber = NonNegativeNumber.nullable();
const Rate = z.number().finite().min(0).max(1).nullable();
const CachePricingSchema = z.object({
  cached_input: DecimalString.optional(),
  cached_output: DecimalString.optional(),
  cache_read: DecimalString.optional(),
  cache_write: DecimalString.optional(),
});
const VideoPriceTierSchema = z.object({
  resolution: z.string().optional(),
  size: z.string().optional(),
  quality: z.string().optional(),
  sound: z.boolean().optional(),
  billing_strategy: z.literal("provider_quote").optional(),
  static_price_role: z.literal("catalog_fallback").optional(),
  public_price_usd_per_second: DecimalString.optional(),
}).passthrough();
const VideoRoutePriceSchema = z.object({
  request_type: z.string().optional(),
  billing_strategy: z.literal("provider_quote").optional(),
  static_price_role: z.literal("catalog_fallback").optional(),
  public_price_usd_per_second: DecimalString.optional(),
  price_tiers_usd_per_second: z.array(VideoPriceTierSchema).optional(),
});

export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  total_items: z.number().int().nonnegative(),
  total_pages: z.number().int().positive(),
});

export const PricingSchema = z.object({
  mode: z.enum(["token", "image", "second"]),
  currency: z.string().min(1),
  unit: z.string().min(1),
  minimum_request_usd: DecimalString.nullable().optional(),
  input: DecimalString.optional(),
  output: DecimalString.optional(),
  price: DecimalString.optional(),
  billing_strategy: z.literal("provider_quote").optional(),
  static_price_role: z.literal("catalog_fallback").optional(),
  cached_input: DecimalString.optional(),
  cached_output: DecimalString.optional(),
  cache_read: DecimalString.optional(),
  cache_write: DecimalString.optional(),
  public_price_usd_per_million: CachePricingSchema.optional(),
  route_prices_usd_per_second: z.array(VideoRoutePriceSchema).optional(),
}).superRefine((pricing, context) => {
  if (pricing.mode === "token" && (!pricing.input || !pricing.output)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Token pricing requires input and output prices" });
  }
  if ((pricing.mode === "image" || pricing.mode === "second") && !pricing.price) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Image and second pricing require price" });
  }
});

export const StatisticsSchema = z.object({
  window: z.string().min(1),
  requests_total: NonNegativeNumber,
  upstream_attempts: NonNegativeNumber,
  successful_requests: NonNegativeNumber,
  client_errors_4xx: NonNegativeNumber,
  server_errors_5xx: NonNegativeNumber,
  timeouts: NonNegativeNumber,
  rate_limited_429: NonNegativeNumber,
  cancelled_requests: NonNegativeNumber,
  success_rate: Rate,
  input_tokens: NonNegativeNumber,
  output_tokens: NonNegativeNumber,
  images_generated: NonNegativeNumber,
  videos_generated: NonNegativeNumber,
  video_seconds_generated: DecimalString,
  jobs_started: NonNegativeNumber,
  jobs_succeeded: NonNegativeNumber,
  jobs_failed: NonNegativeNumber,
  jobs_cancelled: NonNegativeNumber,
  job_success_rate: Rate,
  latency_observations: NonNegativeNumber,
  latency_avg_ms: NullableNonNegativeNumber,
  latency_p50_ms: NullableNonNegativeNumber,
  latency_p95_ms: NullableNonNegativeNumber,
  ttft_observations: NonNegativeNumber,
  ttft_avg_ms: NullableNonNegativeNumber,
  ttft_p50_ms: NullableNonNegativeNumber,
  ttft_p95_ms: NullableNonNegativeNumber,
  first_bucket: Timestamp.nullable(),
  last_bucket: Timestamp.nullable(),
});

export const ApiInterfaceSchema = z.object({
  path: z.string().startsWith("/"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  schema: z.string().min(1),
  docs_url: z.string().url().nullable(),
  operation: z.string().min(1),
  asynchronous: z.boolean(),
});

export const ModelCoreSchema = z.object({
  model_id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid public slug").refine((slug) => !slug.includes("--"), "Public slugs cannot contain --"),
  display_name: z.string().min(1),
  status: z.enum(["active", "retired"]),
  model_type: z.enum(["chat", "image", "video"]),
  tier: z.string().min(1).nullable().optional(),
  pricing: PricingSchema,
  context_window: z.object({ tokens: NonNegativeNumber.nullable(), chars: NonNegativeNumber.nullable() }),
  modalities: z.object({ input: z.array(z.string()), output: z.array(z.string()) }),
  capabilities: z.object({
    tools: NullableBoolean,
    stream: NullableBoolean,
    vision: NullableBoolean,
    json_mode: NullableBoolean,
    reasoning: NullableBoolean,
    image_generation: NullableBoolean,
    image_edits: NullableBoolean,
    video_generation: NullableBoolean,
    video_async: NullableBoolean,
    atlascloud_video: NullableBoolean,
    max_reference_images: NonNegativeNumber.nullable().optional(),
    max_reference_image_bytes: NonNegativeNumber.nullable().optional(),
    supported_sizes: z.array(z.string()).optional(),
    supported_seconds: z.array(NonNegativeNumber).optional(),
    requires_reference_image: NullableBoolean,
  }).passthrough(),
  schema_endpoints: z.array(z.string()),
  api_interfaces: z.array(ApiInterfaceSchema).min(1),
  usage_based_only: NullableBoolean,
  stream: NullableBoolean,
  json_mode: NullableBoolean,
  reasoning: NullableBoolean,
  tools_calling: NullableBoolean,
  source_created_at: Timestamp.nullable().optional(),
  first_seen_at: Timestamp.optional(),
  updated_at: Timestamp.optional(),
}).passthrough();

export const ModelListItemSchema = ModelCoreSchema.extend({ statistics: StatisticsSchema, first_seen_at: Timestamp, updated_at: Timestamp });
export const ModelDetailSchema = ModelCoreSchema.extend({
  first_seen_at: Timestamp,
  updated_at: Timestamp,
  statistics: z.record(StatisticsSchema).optional(),
  data_available_from: Timestamp.nullable().optional(),
  latest_metrics_bucket: Timestamp.nullable().optional(),
  related_models: z.array(ModelCoreSchema).optional(),
});

export const ModelListResponseSchema = z.object({
  data: z.array(ModelListItemSchema),
  pagination: PaginationSchema,
  catalog_version: z.string().min(1),
  catalog_updated_at: Timestamp,
  metrics_snapshot_at: Timestamp.nullable(),
});

export const HistoryItemSchema = z.object({
  effective_from: Timestamp,
  effective_to: Timestamp.nullable(),
  snapshot: ModelCoreSchema,
  changed_fields: z.array(z.string()),
});
export const HistoryResponseSchema = z.object({ data: z.array(HistoryItemSchema), pagination: PaginationSchema });

export const MetricsPointSchema = StatisticsSchema.omit({ window: true, first_bucket: true, last_bucket: true }).extend({ bucket_start: Timestamp });
export const MetricsResponseSchema = z.object({
  range: z.string().min(1),
  interval: z.string().min(1),
  points: z.array(MetricsPointSchema),
  sample_size: NonNegativeNumber,
  data_available_from: Timestamp.nullable(),
  latest_complete_bucket: Timestamp.nullable(),
  generated_at: Timestamp,
});

export const StatisticsSummarySchema = z.object({
  range: z.string(),
  models: z.object({ total: NonNegativeNumber, active: NonNegativeNumber, retired: NonNegativeNumber, chat: NonNegativeNumber, image: NonNegativeNumber, video: NonNegativeNumber, models_with_requests: NonNegativeNumber }),
  requests: z.object({ total: NonNegativeNumber, successful: NonNegativeNumber, client_errors_4xx: NonNegativeNumber, server_errors_5xx: NonNegativeNumber, timeouts: NonNegativeNumber, rate_limited_429: NonNegativeNumber, cancelled: NonNegativeNumber, success_rate: Rate }),
  usage: z.object({ input_tokens: NonNegativeNumber, output_tokens: NonNegativeNumber, images_generated: NonNegativeNumber, videos_generated: NonNegativeNumber, video_seconds_generated: DecimalString }),
  jobs: z.object({ started: NonNegativeNumber, succeeded: NonNegativeNumber, failed: NonNegativeNumber, cancelled: NonNegativeNumber, success_rate: Rate }),
  latency: z.object({ observations: NonNegativeNumber, average_ms: NullableNonNegativeNumber, p50_ms: NullableNonNegativeNumber, p95_ms: NullableNonNegativeNumber }),
  data_available_from: Timestamp.nullable(),
  latest_complete_bucket: Timestamp.nullable(),
  generated_at: Timestamp,
});

export const VersionResponseSchema = z.object({ schema_version: z.number().int().positive(), catalog_version: z.string().min(1), catalog_updated_at: Timestamp, latest_metrics_bucket: Timestamp.nullable() });

const DENIED_PUBLIC_KEYS = /(?:^|_)(?:provider|owned_by|supplier|vendor|upstream_model|deployment|backend|hostname|region|internal_cost|margin)(?:$|_)/i;

export function assertNoProviderFields(value: unknown, path = "public"): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoProviderFields(entry, `${path}[${index}]`));
  } else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (DENIED_PUBLIC_KEYS.test(key)) throw new Error(`Provider-related public field is not allowed: ${path}.${key}`);
      assertNoProviderFields(entry, `${path}.${key}`);
    }
  }
}

export function assertUniqueModels(models: Array<z.infer<typeof ModelCoreSchema>>): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const model of models) {
    if (ids.has(model.model_id)) throw new Error(`Duplicate public model_id: ${model.model_id}`);
    if (slugs.has(model.slug)) throw new Error(`Duplicate public slug: ${model.slug}`);
    ids.add(model.model_id);
    slugs.add(model.slug);
    assertNoProviderFields(model);
  }
}
