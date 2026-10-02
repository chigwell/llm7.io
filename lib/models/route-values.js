export const SITE_URL = "https://llm7.io";

export function modelPath(slug) {
  return `/models/${slug}/`;
}

export function comparisonKey(leftSlug, rightSlug) {
  return `${leftSlug}--vs--${rightSlug}`;
}

export function comparisonPath(leftSlug, rightSlug) {
  return `/compare/${comparisonKey(leftSlug, rightSlug)}/`;
}

export function absoluteUrl(path) {
  return new URL(path, SITE_URL).toString();
}

export function canonicalPairKey(pair) {
  const parts = pair.split("--vs--");
  return parts.length === 2 && parts[0] && parts[1] ? pair : null;
}
