import type { Metadata } from "next";
import Link from "next/link";
import ComparisonSelector from "@/components/models/ComparisonSelector.client";
import { JsonLd, SeoFooter, SeoNavigation } from "@/components/models/SeoChrome";
import { createComparisonPairs } from "@/lib/models/comparisons";
import { comparisonPath } from "@/lib/models/routes";
import { publicModels } from "@/lib/models/snapshot";
import { siteStructuredData } from "@/lib/models/structured-data";

export const metadata: Metadata = {
  title: "Compare LLM7 API Models: Pricing and Statistics | LLM7",
  description: "Compare active LLM7 API models of the same type using current pricing, published specifications, and observed LLM7 statistics.",
  alternates: { canonical: "https://llm7.io/compare/" },
  robots: { index: true, follow: true },
  openGraph: { title: "Compare LLM7 API Models: Pricing and Statistics | LLM7", description: "Compare current LLM7 model pricing and observed API statistics.", url: "https://llm7.io/compare/", images: ["https://llm7.io/generated/og/model-comparison.png"] },
  twitter: { card: "summary_large_image", images: ["https://llm7.io/generated/og/model-comparison.png"] },
};

export default function CompareIndexPage() {
  const pairs = Object.values(createComparisonPairs(publicModels));
  const grouped = (["chat", "image", "video"] as const).map((type) => [type, pairs.filter((pair) => publicModels.find((model) => model.slug === pair.leftSlug)?.model_type === type).slice(0, 8)] as const);
  const name = (slug: string) => publicModels.find((model) => model.slug === slug)?.model_id ?? slug;

  return (
    <>
      <SeoNavigation />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
        <JsonLd data={siteStructuredData()} />
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground"><Link className="transition-colors hover:text-foreground" href="/">Home</Link><span className="px-2">/</span><span className="text-foreground">Compare</span></nav>
        <header className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/55 to-primary/5 p-6 shadow-sm backdrop-blur md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Model comparison</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Compare models with confidence.</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">Pick two available models of the same kind. We&apos;ll put their price, capabilities, and observed LLM7 usage side by side.</p>
          <ComparisonSelector models={publicModels.map(({ slug, model_id, model_type, status }) => ({ slug, display_name: model_id, model_type, status }))} />
        </header>

        <section className="mt-10" aria-labelledby="popular-comparisons">
          <div className="mb-6"><h2 id="popular-comparisons" className="text-2xl font-semibold">Start with a popular comparison</h2><p className="mt-1 text-sm text-muted-foreground">Choose a pair to jump straight into the details.</p></div>
          <div className="grid gap-5 lg:grid-cols-3">{grouped.map(([type, typePairs]) => <section key={type} className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur"><h3 className="text-lg font-semibold capitalize">{type} models</h3>{typePairs.length ? <div className="mt-4 space-y-2">{typePairs.map((pair) => <Link key={pair.leftSlug + "-" + pair.rightSlug} className="block rounded-xl border border-border/60 bg-background/45 px-3 py-3 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5" href={comparisonPath(pair.leftSlug, pair.rightSlug)}>{name(pair.leftSlug)}<span className="px-1 text-muted-foreground">vs</span>{name(pair.rightSlug)}</Link>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No matching pair is available yet.</p>}</section>)}</div>
        </section>
      </main>
      <SeoFooter />
    </>
  );
}
