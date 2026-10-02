export const timestamp = "2026-01-01T00:00:00.000Z";
export const statistics = {
  window: "30d",
  requests_total: 20,
  upstream_attempts: 21,
  successful_requests: 19,
  client_errors_4xx: 0,
  server_errors_5xx: 1,
  timeouts: 0,
  rate_limited_429: 0,
  cancelled_requests: 0,
  success_rate: 0.95,
  input_tokens: 1000,
  output_tokens: 500,
  images_generated: 0,
  videos_generated: 0,
  video_seconds_generated: "0",
  jobs_started: 0,
  jobs_succeeded: 0,
  jobs_failed: 0,
  jobs_cancelled: 0,
  job_success_rate: null,
  latency_observations: 20,
  latency_avg_ms: 100,
  latency_p50_ms: 100,
  latency_p95_ms: 120,
  ttft_observations: 0,
  ttft_avg_ms: null,
  ttft_p50_ms: null,
  ttft_p95_ms: null,
  first_bucket: timestamp,
  last_bucket: timestamp,
};
export function model(slug, type = "chat", status = "active") {
  const tokenPriced = type === "chat" || type === "systemone";
  return {
    model_id: slug,
    slug,
    display_name: slug,
    model_type: type,
    status,
    pricing:
      tokenPriced
        ? {
            mode: "token",
            currency: "USD",
            unit: "1M tokens",
            input: "0.1",
            output: "0.2",
          }
        : {
            mode: type === "image" ? "image" : "second",
            currency: "USD",
            unit: type === "image" ? "image" : "second",
            price: type === "audio_to_text" ? "0.000003333334" : "0.05",
          },
    context_window: { tokens: null, chars: null },
    modalities: {
      input: type === "systemone" ? ["text", "json"] : type === "audio_to_text" ? ["audio"] : ["text"],
      output: [type === "chat" || type === "audio_to_text" ? "text" : type === "systemone" ? "json" : type],
    },
    capabilities:
      type === "systemone"
        ? {
            systemone: true,
            typed_answers: true,
            noul: true,
            choice: true,
            score: true,
            confidence: true,
          }
        : type === "audio_to_text"
          ? { tools: true, stream: true, vision: true, json_mode: true, reasoning: true }
          : {},
    schema_endpoints: type === "systemone" ? ["systemone"] : type === "audio_to_text" ? ["audio"] : [],
    api_interfaces: [
      {
        path: type === "systemone" ? "/v1/systemone" : type === "audio_to_text" ? "/v1/audio/transcriptions" : "/v1/chat/completions",
        method: "POST",
        schema: type === "systemone" ? "systemone" : type === "audio_to_text" ? "audio" : "chat",
        docs_url: null,
        operation: "generate",
        asynchronous: false,
      },
    ],
    first_seen_at: timestamp,
    updated_at: timestamp,
    statistics: { "30d": { ...statistics } },
  };
}
export const models = [
  model("chat-b"),
  model("image-one", "image"),
  model("chat-a"),
  model("video-one", "video"),
  model("retired-chat", "chat", "retired"),
];
export const version = {
  schema_version: 1,
  catalog_version: "fixture-v1",
  catalog_updated_at: timestamp,
  latest_metrics_bucket: timestamp,
};
export const metrics = {
  range: "30d",
  interval: "1d",
  points: [],
  sample_size: 0,
  data_available_from: null,
  latest_complete_bucket: null,
  generated_at: timestamp,
};
export const summary = {
  range: "30d",
  models: {
    total: 5,
    active: 4,
    retired: 1,
    chat: 3,
    image: 1,
    video: 1,
    models_with_requests: 5,
  },
  requests: {
    total: 100,
    successful: 95,
    client_errors_4xx: 0,
    server_errors_5xx: 5,
    timeouts: 0,
    rate_limited_429: 0,
    cancelled: 0,
    success_rate: 0.95,
  },
  usage: {
    input_tokens: 5000,
    output_tokens: 2500,
    images_generated: 0,
    videos_generated: 0,
    video_seconds_generated: "0",
  },
  jobs: {
    started: 0,
    succeeded: 0,
    failed: 0,
    cancelled: 0,
    success_rate: null,
  },
  latency: { observations: 100, average_ms: 100, p50_ms: 100, p95_ms: 120 },
  data_available_from: timestamp,
  latest_complete_bucket: timestamp,
  generated_at: timestamp,
};
export function listPage(page = 1) {
  return {
    data: models
      .slice((page - 1) * 3, page * 3)
      .map((m) => ({ ...m, statistics: { ...statistics } })),
    pagination: { page, page_size: 3, total_items: 5, total_pages: 2 },
    catalog_version: version.catalog_version,
    catalog_updated_at: timestamp,
    metrics_snapshot_at: timestamp,
  };
}
