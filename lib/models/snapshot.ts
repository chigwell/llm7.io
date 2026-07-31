import rawSnapshot from "@/data/generated/public-model-data.json";
import { assertNoProviderFields, assertUniqueModels, MetricsResponseSchema, ModelDetailSchema, ModelListResponseSchema, StatisticsSummarySchema, VersionResponseSchema } from "./schema";
import type { PublicModelDataSnapshot } from "./api-types";

function validateSnapshot(value: unknown): PublicModelDataSnapshot {
  const snapshot = value as PublicModelDataSnapshot;
  VersionResponseSchema.parse(snapshot.version);
  StatisticsSummarySchema.parse(snapshot.summary);
  snapshot.list_pages.forEach((page) => ModelListResponseSchema.parse(page));
  const listedModels = snapshot.list_pages.flatMap((page) => page.data);
  const expectedModels = snapshot.list_pages[0]?.pagination.total_items ?? 0;
  if (listedModels.length !== expectedModels) throw new Error(`Snapshot model pagination mismatch: expected ${expectedModels}, got ${listedModels.length}`);
  if (snapshot.models.length !== expectedModels) throw new Error(`Snapshot detail count mismatch: expected ${expectedModels}, got ${snapshot.models.length}`);
  snapshot.models.forEach(({ model, metrics }) => {
    ModelDetailSchema.parse(model);
    MetricsResponseSchema.parse(metrics);
    assertNoProviderFields({ model, metrics });
  });
  assertUniqueModels(snapshot.models.map(({ model }) => model));
  assertNoProviderFields(value);
  return snapshot;
}

export const publicModelSnapshot = validateSnapshot(rawSnapshot);
export const publicModels = publicModelSnapshot.models.map(({ model }) => model).sort((a, b) => a.slug.localeCompare(b.slug));

export function getModelSnapshot(slug: string) {
  return publicModelSnapshot.models.find((entry) => entry.model.slug === slug);
}
