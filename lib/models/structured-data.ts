import type { PublicModel } from "./api-types";
import { absoluteUrl, comparisonPath, modelPath } from "./routes";

const organization = { "@type": "Organization", name: "LLM7", url: "https://llm7.io" };
export function siteStructuredData() { return { "@context": "https://schema.org", "@graph": [organization, { "@type": "WebSite", name: "LLM7", url: "https://llm7.io" }] }; }
export function breadcrumbs(items: Array<{ name: string; path: string }>) { return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })) }; }
export function modelStructuredData(model: PublicModel, faq: Array<{ question: string; answer: string }>) {
  const path = modelPath(model.slug);
  const data: unknown[] = [
    { "@context": "https://schema.org", "@type": "WebPage", name: model.model_id, url: absoluteUrl(path), isPartOf: { "@id": "https://llm7.io" } },
    breadcrumbs([{ name: "Home", path: "/" }, { name: "Models", path: "/models/" }, { name: model.model_id, path }]),
    { "@context": "https://schema.org", "@type": "Service", name: `${model.model_id} API access`, url: absoluteUrl(path), serviceType: "AI model API", offeredBy: organization },
  ];
  if (faq.length) data.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) });
  return data;
}
export function comparisonStructuredData(left: PublicModel, right: PublicModel, faq: Array<{ question: string; answer: string }>) {
  const path = comparisonPath(left.slug, right.slug);
  const data: unknown[] = [
    { "@context": "https://schema.org", "@type": "WebPage", name: `${left.model_id} vs ${right.model_id}`, url: absoluteUrl(path) },
    breadcrumbs([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare/" }, { name: `${left.model_id} vs ${right.model_id}`, path }]),
    { "@context": "https://schema.org", "@type": "ItemList", itemListElement: [left, right].map((model, position) => ({ "@type": "ListItem", position: position + 1, item: { "@type": "Service", name: `${model.model_id} API access`, url: absoluteUrl(modelPath(model.slug)) } })) },
  ];
  if (faq.length) data.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) });
  return data;
}
