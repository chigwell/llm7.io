import { componentMap, ComponentCategoryMap } from "@/data/ComponentMapping";

type FilterOptions = {
  excludeCategories?: string[];
  includeCategories?: string[];
  minComponentsInCategory?: number;
  maxComponentsInCategory?: number;
};

export function countComponents(
  options?: FilterOptions,
  customMap?: ComponentCategoryMap
): number {
  const mapToUse = customMap || componentMap;
  const {
    excludeCategories = ["Get Started"],
    includeCategories,
    minComponentsInCategory,
    maxComponentsInCategory,
  } = options || {};

  let totalCount = 0;

  Object.entries(mapToUse).forEach(([categoryName, components]) => {
    const componentCount = components.length;

    if (includeCategories && !includeCategories.includes(categoryName)) return;
    if (excludeCategories.includes(categoryName)) return;
    if (minComponentsInCategory && componentCount < minComponentsInCategory)
      return;
    if (maxComponentsInCategory && componentCount > maxComponentsInCategory)
      return;

    totalCount += componentCount;
  });

  return greatestIntegerFunction(totalCount);
}

export function countComponentsInCategory(
  categoryName: string,
  customMap?: ComponentCategoryMap
): number {
  const mapToUse = customMap || componentMap;
  return greatestIntegerFunction(mapToUse[categoryName]?.length || 0);
}

export function getComponentCountBreakdown(
  options?: FilterOptions,
  customMap?: ComponentCategoryMap
): Record<string, number> {
  const mapToUse = customMap || componentMap;
  const {
    excludeCategories = ["Get Started"],
    includeCategories,
    minComponentsInCategory,
    maxComponentsInCategory,
  } = options || {};
  const breakdown: Record<string, number> = {};

  Object.entries(mapToUse).forEach(([categoryName, components]) => {
    const componentCount = components.length;

    if (includeCategories && !includeCategories.includes(categoryName)) return;
    if (excludeCategories.includes(categoryName)) return;
    if (minComponentsInCategory && componentCount < minComponentsInCategory)
      return;
    if (maxComponentsInCategory && componentCount > maxComponentsInCategory)
      return;

    breakdown[categoryName] = greatestIntegerFunction(componentCount);
  });

  return breakdown;
}

export function countAllComponents(customMap?: ComponentCategoryMap): number {
  const mapToUse = customMap || componentMap;
  const total = Object.values(mapToUse).reduce(
    (total, components) => total + components.length,
    0
  );
  return greatestIntegerFunction(total);
}

export function getDynamicStats(
  options?: FilterOptions,
  customMap?: ComponentCategoryMap
) {
  const breakdown = getComponentCountBreakdown(options, customMap);
  const totalComponents = countComponents(options, customMap);
  const totalCategories = Object.keys(breakdown).length;
  const averageComponentsPerCategory =
    totalCategories > 0 ? totalComponents / totalCategories : 0;

  return {
    totalComponents,
    totalCategories,
    averageComponentsPerCategory: greatestIntegerFunction(
      averageComponentsPerCategory
    ),
    breakdown,
    categoryNames: Object.keys(breakdown),
    largestCategory: Object.entries(breakdown).reduce(
      (max, [name, count]) => (count > max.count ? { name, count } : max),
      { name: "", count: 0 }
    ),
    smallestCategory: Object.entries(breakdown).reduce(
      (min, [name, count]) => (count < min.count ? { name, count } : min),
      { name: "", count: Infinity }
    ),
  };
}

export function greatestIntegerFunction(value: number): number {
  return Math.floor(value);
}
