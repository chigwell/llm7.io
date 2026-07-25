import type { PublicModel } from "./api-types";
import { comparisonKey } from "./routes";

export type ComparisonPair = { leftSlug: string; rightSlug: string };

export function createComparisonPairs(models: PublicModel[]): Record<string, ComparisonPair> {
  const pairs: Record<string, ComparisonPair> = {};
  for (const type of ["chat", "image", "video"] as const) {
    const group = models.filter((model) => model.status === "active" && model.model_type === type).sort((a, b) => a.slug.localeCompare(b.slug));
    for (let left = 0; left < group.length; left += 1) {
      for (let right = left + 1; right < group.length; right += 1) {
        const leftModel = group[left];
        const rightModel = group[right];
        if (leftModel.model_type !== rightModel.model_type) throw new Error("Cross-type comparison attempted");
        pairs[comparisonKey(leftModel.slug, rightModel.slug)] = { leftSlug: leftModel.slug, rightSlug: rightModel.slug };
      }
    }
  }
  return pairs;
}

export function comparisonCountByType(models: PublicModel[]) {
  return (["chat", "image", "video"] as const).reduce((counts, type) => {
    const n = models.filter((model) => model.status === "active" && model.model_type === type).length;
    counts[type] = (n * (n - 1)) / 2;
    return counts;
  }, {} as Record<PublicModel["model_type"], number>);
}

export function getPairMap(models: PublicModel[]) {
  return createComparisonPairs(models);
}
