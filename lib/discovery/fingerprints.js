import { createHash } from "node:crypto";
import { TEMPLATE_VERSION } from "./pages.js";
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable(value[key])]),
    );
  return value;
}
export function contentModel(model) {
  // Metrics and synchronization timestamps are not rendered in discovery pages.
  const omitted = new Set([
    "statistics",
    "related_models",
    "updated_at",
    "first_seen_at",
    "source_created_at",
    "latest_metrics_bucket",
    "data_available_from",
  ]);
  return Object.fromEntries(
    Object.entries(model).filter(([key]) => !omitted.has(key)),
  );
}
export function pageState(
  pages,
  previous = {},
  now = new Date().toISOString(),
  templateDigest = "",
) {
  return Object.fromEntries(
    pages.map((page) => {
      const content = {
        ...page,
        models: page.models.map(contentModel),
        ...(page.original ? { original: contentModel(page.original) } : {}),
      };
      const fingerprint = createHash("sha256")
        .update(
          JSON.stringify(
            stable({ version: TEMPLATE_VERSION, templateDigest, content }),
          ),
        )
        .digest("hex");
      return [
        page.path,
        {
          fingerprint,
          lastmod:
            previous[page.path]?.fingerprint === fingerprint
              ? previous[page.path].lastmod
              : now,
          indexable: page.indexable,
        },
      ];
    }),
  );
}
