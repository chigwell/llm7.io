import type { PublicModel } from "./api-types";
import type { ComparisonPair } from "./comparisons";
type ComparableModel = Pick<PublicModel, "slug" | "model_id" | "model_type" | "status">;
export function areComparableModels(
  leftModel: ComparableModel,
  rightModel: ComparableModel,
): boolean;
export function createComparisonPairs(
  models: PublicModel[],
): Record<string, ComparisonPair>;
export function comparisonCountByType(
  models: PublicModel[],
): Record<PublicModel["model_type"], number>;
export function getPairMap(
  models: PublicModel[],
): Record<string, ComparisonPair>;
