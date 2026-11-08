export type ComparisonPair = { leftSlug: string; rightSlug: string };
export { areComparableModels, createComparisonPairs, comparisonCountByType, getPairMap } from "./comparison-values.js";

// Deterministic shuffle: each page gets its own stable mix, so links spread across all items
// instead of always favouring the alphabetically first ones, and stay put between builds.
function seededHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

export function seededPick<T>(items: T[], seed: string, count: number, keyOf: (item: T) => string) {
  return items.map((item) => ({ item, rank: seededHash(seed + "|" + keyOf(item)) })).sort((a, b) => a.rank - b.rank).slice(0, count).map(({ item }) => item);
}
