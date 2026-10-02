import {
  model,
  metrics,
  summary,
  version,
  listPage,
} from "../fixtures/models.mjs";
const change = (value, fn) => {
  const next = structuredClone(value);
  fn(next);
  return next;
};
export const schemaCases = [
  ["detail", model("chat-a")],
  ["detail", model("retired", "chat", "retired")],
  ["detail", model("image-a", "image")],
  ["detail", model("video-a", "video")],
  ...[
    (m) => {
      m.slug = "invalid--slug";
    },
    (m) => {
      m.tier = "";
    },
    (m) => {
      m.pricing.input = "-1";
    },
    (m) => {
      m.pricing.input = "0";
    },
    (m) => {
      m.pricing.input = 0.1;
    },
    (m) => {
      delete m.pricing.output;
    },
    (m) => {
      m.pricing.extra = "strip";
    },
    (m) => {
      m.updated_at = "bad date";
    },
    (m) => {
      m.updated_at = "2999-01-01";
    },
    (m) => {
      m.statistics["30d"].window = "";
    },
    (m) => {
      m.capabilities.atlascloud_video = "legacy passthrough";
    },
    (m) => {
      m.capabilities.atlascloud_routes = { provider_name: "internal" };
    },
    (m) => {
      m.capabilities.provider_name = "reject";
    },
    (m) => {
      m.extra = "keep";
    },
  ].map((fn) => ["detail", change(model("chat-a"), fn)]),
  ["list", listPage()],
  ["metrics", metrics],
  ["metrics", { ...metrics, range: "", interval: "" }],
  ["summary", summary],
  ["version", version],
  ["version", { ...version, catalog_updated_at: "invalid" }],
];
export function schemaResults(schemas, parse) {
  return schemaCases.map(([name, value]) => {
    try {
      return { ok: true, value: parse(schemas[name], value) };
    } catch (error) {
      return { ok: false, error: error.issues ?? error.message };
    }
  });
}
