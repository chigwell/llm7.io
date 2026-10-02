import { MODEL_TYPES } from "./model-types.js";
import { comparisonKey } from "./route-values.js";

const ANTHROPIC_MODEL_PREFIX = "anthropic/";

function stripsAnthropicPrefixTo(leftId, rightId) {
  return (
    leftId.startsWith(ANTHROPIC_MODEL_PREFIX) &&
    leftId.slice(ANTHROPIC_MODEL_PREFIX.length) === rightId
  );
}

export function areComparableModels(leftModel, rightModel) {
  if (leftModel.slug === rightModel.slug) return false;
  if (leftModel.status !== "active" || rightModel.status !== "active")
    return false;
  if (leftModel.model_type !== rightModel.model_type) return false;
  return !(
    stripsAnthropicPrefixTo(leftModel.model_id, rightModel.model_id) ||
    stripsAnthropicPrefixTo(rightModel.model_id, leftModel.model_id)
  );
}

export function createComparisonPairs(models) {
  const pairs = {};
  for (const type of MODEL_TYPES) {
    const group = models
      .filter((model) => model.status === "active" && model.model_type === type)
      .sort((a, b) => a.slug.localeCompare(b.slug));
    for (let left = 0; left < group.length; left += 1) {
      for (let right = left + 1; right < group.length; right += 1) {
        const leftModel = group[left];
        const rightModel = group[right];
        if (!areComparableModels(leftModel, rightModel)) continue;
        pairs[comparisonKey(leftModel.slug, rightModel.slug)] = {
          leftSlug: leftModel.slug,
          rightSlug: rightModel.slug,
        };
      }
    }
  }
  return pairs;
}

export function comparisonCountByType(models) {
  return MODEL_TYPES.reduce((counts, type) => {
    const group = models.filter(
      (model) => model.status === "active" && model.model_type === type,
    );
    let count = 0;
    for (let left = 0; left < group.length; left += 1) {
      for (let right = left + 1; right < group.length; right += 1) {
        if (areComparableModels(group[left], group[right])) count += 1;
      }
    }
    counts[type] = count;
    return counts;
  }, {});
}

export function getPairMap(models) {
  return createComparisonPairs(models);
}
