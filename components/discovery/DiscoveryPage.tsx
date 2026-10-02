import type { Metadata } from "next";
import Link from "next/link";
import {
  JsonLd,
  SeoFooter,
  SeoNavigation,
} from "@/components/models/SeoChrome";
import ModelCodeExamples from "@/components/models/ModelCodeExamples.client";
import { codeExamplesForModel } from "@/lib/models/code-examples";
import { areComparableModels } from "@/lib/models/comparisons";
import { formatPrice, pricesDirectlyComparable } from "@/lib/models/format";
import { comparisonPath } from "@/lib/models/routes";
import {
  facts,
  featureExample,
  chatInterface,
  type DiscoveryPage as Page,
} from "@/lib/discovery/pages.js";
import { discoveryPages } from "@/lib/discovery/snapshot";
import Explorer from "./Explorer.client";

export function metadataFor(page?: Page): Metadata {
  if (!page) return {};
  const image = `https://llm7.io/generated/og/discovery/${page.family}.png`;
  return {
    title: `${page.title} | LLM7`,
    description: page.description,
    alternates: { canonical: `https://llm7.io${page.path}` },
    robots: { index: page.indexable, follow: true },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `https://llm7.io${page.path}`,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [image],
    },
  };
}
export default function DiscoveryPage({ page }: { page: Page }) {
  const parent =
    page.family === "features"
      ? { path: "/models/features/", title: "Model capabilities" }
      : page.family === "integrations"
        ? { path: "/integrations/", title: "Integrations" }
        : page.family === "calculators"
          ? { path: "/cost-calculator/", title: "Cost calculators" }
          : {
              path: `/models/${page.original?.slug}/`,
              title: page.original?.model_id ?? "Models",
            };
  const crumbs = [
    { path: "/", title: "Home" },
    ...(page.path !== parent.path ? [parent] : []),
    { path: page.path, title: page.title },
  ];
  const related = discoveryPages
    .filter(
      (p) =>
        p.path !== page.path &&
        !p.children &&
        p.family !== "alternatives" &&
        p.models.some((m) => page.models.some((n) => n.slug === m.slug)),
    )
    .slice(0, 12);
  return (
    <>
      <SeoNavigation />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 space-y-8">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "@id": `https://llm7.io${page.path}`,
                name: page.title,
                description: page.description,
                url: `https://llm7.io${page.path}`,
                mainEntity: {
                  "@type": "ItemList",
                  itemListElement: page.models.map((m, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    name: m.model_id,
                    url: `https://llm7.io/models/${m.slug}/`,
                  })),
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: crumbs.map((c, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: c.title,
                  item: `https://llm7.io${c.path}`,
                })),
              },
            ],
          }}
        />
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap gap-2 text-sm text-muted-foreground"
        >
          {crumbs.map((c, i) => (
            <span key={c.path}>
              {i ? " / " : ""}
              {i === crumbs.length - 1 ? (
                c.title
              ) : (
                <Link href={c.path}>{c.title}</Link>
              )}
            </span>
          ))}
        </nav>
        <header className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 to-primary/5 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            LLM7 model guide
          </p>
          <h1 className="mt-3 break-words text-3xl font-bold md:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {page.description}
          </p>
        </header>
        {!page.indexable ? (
          <p>No eligible models are currently published for this page.</p>
        ) : null}
        {page.children ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.children.map((c) => (
              <Link
                className="rounded-2xl border bg-card/55 p-6 font-semibold hover:border-primary"
                key={c.path}
                href={c.path}
              >
                {c.title}
                <span className="mt-2 block text-sm font-normal text-muted-foreground">
                  {c.indexable
                    ? "Explore models and guidance"
                    : "No eligible models currently"}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
        {page.template?.limitation ? (
          <section>
            <h2 className="text-2xl font-semibold">
              Requirements and limitations
            </h2>
            <p className="mt-3 text-muted-foreground">
              {page.template.limitation}
            </p>
            {page.family === "features" ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Only active chat models with explicit support are included.
                Missing capability values remain unknown; top-level values take
                precedence over nested values. Image input also establishes
                vision support.
              </p>
            ) : null}
          </section>
        ) : null}
        {page.template?.steps ? (
          <section>
            <h2 className="text-2xl font-semibold">Setup</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-6">
              {page.template.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
        ) : null}
        {!page.children &&
        page.family !== "alternatives" &&
        page.models.length ? (
          <Explorer page={page} />
        ) : null}
        {page.family === "features" && page.models[0] ? (
          <section>
            <h2 className="text-2xl font-semibold">Example request</h2>
            {chatInterface(page.models[0]) ? (
              <pre className="mt-4 overflow-x-auto rounded-xl border bg-card/55 p-4 text-sm">
                <code>{featureExample(page.slug, page.models[0])}</code>
              </pre>
            ) : (
              <ModelCodeExamples
                examples={codeExamplesForModel(page.models[0])}
              />
            )}
          </section>
        ) : null}
        {page.original ? (
          <section className="space-y-5">
            <h2 className="text-2xl font-semibold">
              Alternatives to {page.original.model_id}
            </h2>
            <p>
              The original model is {page.original.status}. Ranking uses shared
              reported capabilities and modalities, then the closest known
              context window, then model ID. Unknown context differences sort
              last. Similar metadata does not establish equivalent output
              quality.
            </p>
            <p>
              Original pricing: {formatPrice(page.original)}. Original context:{" "}
              {page.original.context_window.tokens?.toLocaleString("en-US") ??
                "Unknown"}{" "}
              tokens.
            </p>
            {page.models.map((m) => {
              const original = page.original!;
              const before = facts(original),
                after = facts(m);
              const matches = before.filter((f) => after.includes(f));
              const lost = before.filter((f) => !after.includes(f));
              const interfaces = (model: typeof m) =>
                model.api_interfaces.map((a) => `${a.method} ${a.path}`).sort();
              const changed =
                JSON.stringify(interfaces(original)) !==
                JSON.stringify(interfaces(m));
              return (
                <article
                  className="rounded-2xl border bg-card/55 p-5 space-y-3"
                  key={m.slug}
                >
                  <h3 className="text-xl font-semibold">
                    <Link className="text-primary" href={`/models/${m.slug}/`}>
                      {m.model_id}
                    </Link>
                  </h3>
                  <p>
                    Matching features:{" "}
                    {matches.join(", ") || "None explicitly reported"}.
                  </p>
                  <p>
                    Original features not confirmed on this alternative:{" "}
                    {lost.join(", ") || "None"}. Missing reports are unknown,
                    not confirmed losses.
                  </p>
                  <p>
                    Context: {original.context_window.tokens ?? "Unknown"} →{" "}
                    {m.context_window.tokens ?? "Unknown"} tokens
                    {original.context_window.tokens != null &&
                    m.context_window.tokens != null
                      ? ` (${m.context_window.tokens - original.context_window.tokens >= 0 ? "+" : ""}${m.context_window.tokens - original.context_window.tokens})`
                      : ""}
                    .
                  </p>
                  <p>
                    {formatPrice(m)}.{" "}
                    {pricesDirectlyComparable(original, m)
                      ? "Prices use the same billing mode, currency, and unit; compare the rates above."
                      : "Prices are not directly comparable; units, billing modes, or dynamic quotes differ."}
                  </p>
                  <p>
                    Change the request model ID from{" "}
                    <code className="break-all">{original.model_id}</code> to{" "}
                    <code className="break-all">{m.model_id}</code>.
                  </p>
                  <p>
                    Original interfaces: {interfaces(original).join(", ")}.
                    Alternative interfaces: {interfaces(m).join(", ")}.{" "}
                    {changed
                      ? "Adjust the endpoint and request body to the selected interface."
                      : "The published API interfaces are unchanged."}
                  </p>
                  {changed ? (
                    <>
                      <h4 className="font-semibold">Original request</h4>
                      <ModelCodeExamples
                        examples={codeExamplesForModel(original)}
                      />
                      <h4 className="font-semibold">Alternative request</h4>
                      <ModelCodeExamples examples={codeExamplesForModel(m)} />
                    </>
                  ) : null}
                  {areComparableModels(original, m) ? (
                    <Link
                      className="text-primary underline"
                      href={
                        original.slug.localeCompare(m.slug) < 0
                          ? comparisonPath(original.slug, m.slug)
                          : comparisonPath(m.slug, original.slug)
                      }
                    >
                      Compare {original.model_id} and {m.model_id}
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </section>
        ) : null}
        {page.template?.sources ? (
          <p className="text-sm text-muted-foreground">
            Instructions reviewed {page.template.reviewed}. Sources:{" "}
            {page.template.sources.map((url, i) => (
              <a className="mr-3 underline" key={url} href={url}>
                {page.template?.title} documentation {i + 1}
              </a>
            ))}
          </p>
        ) : null}
        <section>
          <h2 className="text-2xl font-semibold">Explore related pages</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { path: "/models/", title: "Model catalog" },
              { path: "/compare/", title: "Model comparisons" },
              { path: "/models/features/", title: "Capabilities" },
              { path: "/integrations/", title: "Integrations" },
              { path: "/cost-calculator/", title: "Cost calculators" },
              { path: "/token-calculator/", title: "Token calculator" },
              ...related,
            ]
              .filter((p) => p.path !== page.path)
              .map((p) => (
                <Link
                  key={p.path}
                  href={p.path}
                  className="rounded-xl border px-4 py-3 text-sm hover:border-primary"
                >
                  {p.title}
                </Link>
              ))}
          </div>
        </section>
      </main>
      <SeoFooter />
    </>
  );
}
