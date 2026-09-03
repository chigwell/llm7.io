import { clamp, numberOrZero } from "./modelData.js";

export function pathBetween(source, target, curvature = 0.34) {
  const dx = target.x - source.x;
  const bend = Math.sign(dx || 1) * Math.max(60, Math.abs(dx)) * curvature;
  return {
    p0: { x: source.x, y: source.y },
    p1: { x: source.x + bend, y: source.y },
    p2: { x: target.x - bend, y: target.y },
    p3: { x: target.x, y: target.y },
  };
}

export function pathToArray(path) {
  return [
    path.p0.x,
    path.p0.y,
    path.p1.x,
    path.p1.y,
    path.p2.x,
    path.p2.y,
    path.p3.x,
    path.p3.y,
  ];
}

export function routeD(path) {
  return `M ${path.p0.x} ${path.p0.y} C ${path.p1.x} ${path.p1.y}, ${path.p2.x} ${path.p2.y}, ${path.p3.x} ${path.p3.y}`;
}

export function hexToRgb(hex) {
  const normalized = String(hex || "#22d3ee").replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  const parsed = Number.parseInt(value, 16);
  if (!Number.isFinite(parsed)) return [34 / 255, 211 / 255, 238 / 255];
  return [
    ((parsed >> 16) & 255) / 255,
    ((parsed >> 8) & 255) / 255,
    (parsed & 255) / 255,
  ];
}

export function flowStyle(tokens, maxTokens) {
  const numeric = numberOrZero(tokens);
  if (numeric <= 0) {
    return {
      norm: 0,
      width: 1.2,
      flowWidth: 12,
      seconds: 8,
      size: 1.35,
      opacity: 0.12,
    };
  }

  const norm = clamp(
    Math.log10(numeric + 1) / Math.log10(Math.max(10, numberOrZero(maxTokens) + 1)),
    0.08,
    1,
  );

  return {
    norm,
    width: 2 + norm * 12,
    flowWidth: 14 + norm * 58,
    seconds: clamp(7.4 - norm * 5.8, 1.35, 7.2),
    size: clamp(2.55 - norm * 1.05, 1.25, 2.35),
    opacity: clamp(0.3 + norm * 0.56, 0.3, 0.86),
  };
}
