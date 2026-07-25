export const SITE_URL = "https://llm7.io";

export function modelPath(slug: string): string {
  return `/models/${slug}/`;
}

export function comparisonKey(leftSlug: string, rightSlug: string): string {
  return `${leftSlug}--vs--${rightSlug}`;
}

export function comparisonPath(leftSlug: string, rightSlug: string): string {
  return `/compare/${comparisonKey(leftSlug, rightSlug)}/`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function canonicalPairKey(pair: string): string | null {
  const parts = pair.split("--vs--");
  return parts.length === 2 && parts[0] && parts[1] ? pair : null;
}
