import Decimal from "decimal.js-light";

export function parseTokenPricingUnit(unit) {
  const match = unit.trim().match(/^(\d+(?:\.\d+)?)\s*(k|m)?\s+tokens?$/i);
  if (!match) return null;
  const multiplier =
    match[2]?.toLowerCase() === "m"
      ? "1000000"
      : match[2]?.toLowerCase() === "k"
        ? "1000"
        : "1";
  return new Decimal(match[1]).times(multiplier);
}
