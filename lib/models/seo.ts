import type { Metadata } from "next";
import type { PublicModel } from "./api-types";
import { modelDescription, truncateDescription } from "./content";
import { absoluteUrl, comparisonPath, modelPath } from "./routes";

export function modelMetadata(model: PublicModel): Metadata {
  const title = model.model_type === "chat" ? `${model.model_id} API: Pricing, Context and Statistics | LLM7` : model.model_type === "image" ? `${model.model_id} Image API: Pricing and Statistics | LLM7` : `${model.model_id} Video API: Pricing and Statistics | LLM7`;
  const description = truncateDescription(modelDescription(model));
  const canonical = absoluteUrl(modelPath(model.slug));
  return { title, description, alternates: { canonical }, robots: { index: true, follow: true }, openGraph: { title, description, url: canonical, images: [{ url: absoluteUrl(`/generated/og/models/${model.slug}.png`), width: 1200, height: 630, alt: `${model.model_id} on LLM7` }] }, twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(`/generated/og/models/${model.slug}.png`)] } };
}

export function comparisonMetadata(left: PublicModel, right: PublicModel): Metadata {
  const title = `${left.model_id} vs ${right.model_id}: Price and Statistics | LLM7`;
  const description = truncateDescription(`Compare current LLM7 API pricing, published specifications, and observed LLM7 request statistics for ${left.model_id} and ${right.model_id}.`);
  const canonical = absoluteUrl(comparisonPath(left.slug, right.slug));
  return { title, description, alternates: { canonical }, robots: { index: true, follow: true }, openGraph: { title, description, url: canonical, images: [{ url: absoluteUrl("/generated/og/model-comparison.png"), width: 1200, height: 630, alt: "LLM7 model comparison" }] }, twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/generated/og/model-comparison.png")] } };
}
