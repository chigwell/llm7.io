import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyModelId from "@/components/models/CopyModelId.client";
import ModelCalculator from "@/components/models/ModelCalculator.client";
import ModelCodeExamples from "@/components/models/ModelCodeExamples.client";
import ModelDetailsCard from "@/components/models/ModelDetailsCard";
import ModelLogo from "@/components/models/ModelLogo";
import ModelMetricsCharts from "@/components/models/ModelMetricsCharts.client";
import { JsonLd, SeoFooter, SeoNavigation } from "@/components/models/SeoChrome";
import { codeExamplesForModel } from "@/lib/models/code-examples";
import { modelDescription } from "@/lib/models/content";
import { createComparisonPairs } from "@/lib/models/comparisons";
import { formatMs, formatNumber, formatPrice, formatRate, formatUsd } from "@/lib/models/format";
import { comparisonPath, modelPath } from "@/lib/models/routes";
import { modelMetadata } from "@/lib/models/seo";
import { getModelSnapshot, publicModels } from "@/lib/models/snapshot";
import { modelStructuredData } from "@/lib/models/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicModels.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getModelSnapshot(slug);
  return entry ? modelMetadata(entry.model) : {};
}

type Model = (typeof publicModels)[number];

function Statistics({ model }: { model: Model }) {
  const stats = model.statistics?.["30d"];
  if (!stats || !stats.requests_total) return null;

  const cards = [
    { label: "Requests", value: formatNumber(stats.requests_total), detail: "observed on LLM7" },
    stats.success_rate !== null ? { label: "Success rate", value: formatRate(stats.success_rate), detail: "observed requests" } : null,
    stats.latency_avg_ms !== null && stats.latency_observations ? { label: "Average latency", value: formatMs(stats.latency_avg_ms), detail: "API response time" } : null,
    stats.latency_p95_ms !== null && stats.latency_observations ? { label: "P95 latency", value: formatMs(stats.latency_p95_ms), detail: "slower observed requests" } : null,
  ].filter((card): card is { label: string; value: string; detail: string } => Boolean(card));

  if (!cards.length) return null;

  return (
    <section>
      <div className="mb-5"><h2 className="text-2xl font-semibold">Observed usage</h2><p className="mt-1 text-sm text-muted-foreground">A 30-day snapshot of requests handled by LLM7, not a global benchmark.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">{cards.map((card) => <article key={card.label} className="rounded-2xl border border-border/60 bg-card/55 p-4 shadow-sm backdrop-blur"><p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{card.label}</p><p className="mt-2 text-2xl font-semibold">{card.value}</p><p className="mt-1 text-xs text-muted-foreground">{card.detail}</p></article>)}</div>
    </section>
  );
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getModelSnapshot(slug);
  if (!entry) notFound();

  const { model, metrics } = entry;
  const sameType = publicModels.filter((item) => item.status === "active" && item.model_type === model.model_type && item.slug !== model.slug).sort((left, right) => (right.statistics?.["30d"]?.requests_total ?? 0) - (left.statistics?.["30d"]?.requests_total ?? 0)).slice(0, 6);
  const pairs = createComparisonPairs(publicModels);
  const relatedComparisons = Object.entries(pairs).filter(([, pair]) => pair.leftSlug === model.slug || pair.rightSlug === model.slug).slice(0, 6);
  const examples = codeExamplesForModel(model);

  return (
    <>
      <SeoNavigation />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
        <JsonLd data={modelStructuredData(model, [])} />
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground"><Link className="transition-colors hover:text-foreground" href="/">Home</Link><span className="px-2">/</span><Link className="transition-colors hover:text-foreground" href="/models/">Models</Link><span className="px-2">/</span><span className="text-foreground">{model.model_id}</span></nav>

        <header className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/55 to-primary/5 p-6 shadow-sm backdrop-blur md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{model.model_type} model</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 items-start gap-4"><ModelLogo model={model} size="lg" /><div><h1 className="text-3xl font-bold tracking-tight md:text-5xl">{model.model_id}</h1><p className="mt-4 max-w-3xl text-muted-foreground">{modelDescription(model)}</p></div></div>
            <span className={"rounded-full border px-3 py-1 text-sm font-medium " + (model.status === "active" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300")}>{model.status === "active" ? "Available" : "Retired"}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3"><code className="rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm">{model.model_id}</code><CopyModelId modelId={model.model_id} />{model.status === "active" ? <a className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90" href="https://dash.llm7.io">Get an API key</a> : null}</div>
        </header>

        <div className="mt-8 grid gap-7 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start"><ModelDetailsCard model={model} title="Capabilities & details" /></aside>
          <div className="space-y-8">
            <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Current price</p><h2 className="mt-2 text-2xl font-semibold">Simple, pay-as-you-go pricing</h2></div><span className="rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium">{model.pricing.unit}</span></div>
              <p className="mt-4 text-lg font-medium">{formatPrice(model)}</p>
              {model.pricing.minimum_request_usd ? <p className="mt-2 text-sm text-muted-foreground">Minimum charge per request: {formatUsd(model.pricing.minimum_request_usd)}.</p> : null}
            </section>

            <ModelCalculator mode={model.pricing.mode} unit={model.pricing.unit} inputPrice={model.pricing.input} outputPrice={model.pricing.output} price={model.pricing.price} minimum={model.pricing.minimum_request_usd} durations={model.capabilities.supported_seconds} />

            <Statistics model={model} />
            <ModelMetricsCharts modelType={model.model_type} points={metrics.points} />
            <ModelCodeExamples examples={examples} />

            {sameType.length ? <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur"><h2 className="text-2xl font-semibold">Explore similar models</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{sameType.map((item) => <Link key={item.slug} className="rounded-xl border border-border/60 bg-background/45 px-3 py-3 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5" href={modelPath(item.slug)}>{item.model_id}</Link>)}</div></section> : null}

            {relatedComparisons.length ? <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur"><h2 className="text-2xl font-semibold">Compare this model</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{relatedComparisons.map(([key, pair]) => <Link key={key} className="rounded-xl border border-border/60 bg-background/45 px-3 py-3 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5" href={comparisonPath(pair.leftSlug, pair.rightSlug)}>{publicModels.find((item) => item.slug === pair.leftSlug)?.model_id} vs {publicModels.find((item) => item.slug === pair.rightSlug)?.model_id}</Link>)}</div></section> : null}
          </div>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
