import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ComparisonCharts from "@/components/models/ComparisonCharts.client";
import ModelCalculator from "@/components/models/ModelCalculator.client";
import ModelDetailsCard from "@/components/models/ModelDetailsCard";
import ModelLogo from "@/components/models/ModelLogo";
import VideoPricingBreakdown from "@/components/models/VideoPricingBreakdown";
import { JsonLd, SeoFooter, SeoNavigation } from "@/components/models/SeoChrome";
import { comparisonFacts } from "@/lib/models/content";
import { createComparisonPairs } from "@/lib/models/comparisons";
import { formatBoolean, formatCachePrice, formatContext, formatMs, formatPrice, formatRate, formatUsd, pricesDirectlyComparable } from "@/lib/models/format";
import { comparisonPath, modelPath } from "@/lib/models/routes";
import { comparisonMetadata } from "@/lib/models/seo";
import { getModelSnapshot, publicModels } from "@/lib/models/snapshot";
import { comparisonStructuredData } from "@/lib/models/structured-data";

export const dynamicParams = false;

const pairMap = createComparisonPairs(publicModels);

export function generateStaticParams() {
  return Object.keys(pairMap).map((pair) => ({ pair }));
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const resolved = pairMap[pair];
  const left = resolved && getModelSnapshot(resolved.leftSlug)?.model;
  const right = resolved && getModelSnapshot(resolved.rightSlug)?.model;
  return left && right ? comparisonMetadata(left, right) : {};
}

type Model = (typeof publicModels)[number];
type Difference = { label: string; left: string; right: string; better: "left" | "right" | null };

function specificationDifferences(left: Model, right: Model): Difference[] {
  const rows: Difference[] = [];
  const add = (label: string, leftValue: string, rightValue: string, better: Difference["better"] = null) => {
    if (leftValue !== rightValue && leftValue !== "Not specified" && rightValue !== "Not specified") rows.push({ label, left: leftValue, right: rightValue, better });
  };
  const addOptions = (label: string, leftValues: string[], rightValues: string[]) => {
    const leftValue = leftValues.join(", ") || "Not specified";
    const rightValue = rightValues.join(", ") || "Not specified";
    if (leftValue === rightValue) return;
    const better = leftValues.length === rightValues.length ? null : leftValues.length > rightValues.length ? "left" : "right";
    rows.push({ label, left: leftValue, right: rightValue, better });
  };
  const addSupport = (label: string, leftSupported: boolean, rightSupported: boolean) => add(label, formatBoolean(leftSupported), formatBoolean(rightSupported), leftSupported === rightSupported ? null : leftSupported ? "left" : "right");

  if (left.context_window.tokens !== null && right.context_window.tokens !== null) add("Context window", formatContext(left.context_window.tokens), formatContext(right.context_window.tokens), left.context_window.tokens === right.context_window.tokens ? null : left.context_window.tokens > right.context_window.tokens ? "left" : "right");
  add("Input formats", left.modalities.input.join(", ") || "Not specified", right.modalities.input.join(", ") || "Not specified");
  add("Output formats", left.modalities.output.join(", ") || "Not specified", right.modalities.output.join(", ") || "Not specified");
  addSupport("Vision", Boolean(left.modalities.input.includes("image") || left.capabilities.vision), Boolean(right.modalities.input.includes("image") || right.capabilities.vision));
  addSupport("Tool calling", Boolean(left.tools_calling || left.capabilities.tools), Boolean(right.tools_calling || right.capabilities.tools));
  addSupport("Streaming", Boolean(left.stream || left.capabilities.stream), Boolean(right.stream || right.capabilities.stream));
  addSupport("JSON mode", Boolean(left.json_mode || left.capabilities.json_mode), Boolean(right.json_mode || right.capabilities.json_mode));
  addSupport("Reasoning", Boolean(left.reasoning || left.capabilities.reasoning), Boolean(right.reasoning || right.capabilities.reasoning));
  addOptions("Supported sizes", left.capabilities.supported_sizes ?? [], right.capabilities.supported_sizes ?? []);
  addOptions("Video duration", left.capabilities.supported_seconds?.map((value) => value + "s") ?? [], right.capabilities.supported_seconds?.map((value) => value + "s") ?? []);
  return rows;
}

function PricingCard({ model }: { model: Model }) {
  const primary = model.pricing.mode === "token" ? "Input " + formatUsd(model.pricing.input) + " · Output " + formatUsd(model.pricing.output) + " / " + model.pricing.unit : formatPrice(model);
  const cachePrice = formatCachePrice(model);
  return <article className="rounded-2xl border border-border/60 bg-background/45 p-4"><p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{model.model_id}</p><p className="mt-2 text-lg font-semibold">{primary}</p>{model.model_type === "video" ? <VideoPricingBreakdown pricing={model.pricing} compact /> : null}{cachePrice ? <p className="mt-1 text-xs text-muted-foreground">Cache: {cachePrice}</p> : null}{model.pricing.minimum_request_usd ? <p className="mt-1 text-xs text-muted-foreground">Minimum request: {formatUsd(model.pricing.minimum_request_usd)}</p> : null}</article>;
}

function StatisticsComparison({ left, right }: { left: Model; right: Model }) {
  const leftStats = left.statistics?.["30d"];
  const rightStats = right.statistics?.["30d"];
  if (!leftStats || !rightStats) return null;

  const rows = [
    leftStats.requests_total > 0 && rightStats.requests_total > 0 && leftStats.success_rate !== null && rightStats.success_rate !== null ? { label: "Recent stability", left: formatRate(leftStats.success_rate), right: formatRate(rightStats.success_rate) } : null,
    leftStats.latency_observations > 0 && rightStats.latency_observations > 0 && leftStats.latency_avg_ms !== null && rightStats.latency_avg_ms !== null ? { label: "Average response time", left: formatMs(leftStats.latency_avg_ms), right: formatMs(rightStats.latency_avg_ms) } : null,
    leftStats.latency_observations > 0 && rightStats.latency_observations > 0 && leftStats.latency_p95_ms !== null && rightStats.latency_p95_ms !== null ? { label: "P95 API latency", left: formatMs(leftStats.latency_p95_ms), right: formatMs(rightStats.latency_p95_ms) } : null,
  ].filter((row): row is { label: string; left: string; right: string } => Boolean(row));

  if (!rows.length) return null;

  return <section><div className="mb-5"><h2 className="text-2xl font-semibold">Latest LLM7 statistics</h2><p className="mt-1 text-sm text-muted-foreground">Recent aggregated percentages and response-time metrics from LLM7, not a global model benchmark or traffic disclosure.</p></div><div className="grid gap-3 sm:grid-cols-2">{rows.map((row) => <article key={row.label} className="rounded-2xl border border-border/60 bg-card/55 p-4 shadow-sm backdrop-blur"><p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{row.label}</p><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">{left.model_id}</p><p className="mt-1 font-semibold">{row.left}</p></div><div><p className="text-xs text-muted-foreground">{right.model_id}</p><p className="mt-1 font-semibold">{row.right}</p></div></div></article>)}</div></section>;
}

export default async function ComparisonPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const resolved = pairMap[pair];
  if (!resolved) notFound();

  const leftEntry = getModelSnapshot(resolved.leftSlug);
  const rightEntry = getModelSnapshot(resolved.rightSlug);
  if (!leftEntry || !rightEntry || leftEntry.model.model_type !== rightEntry.model.model_type) notFound();

  const left = leftEntry.model;
  const right = rightEntry.model;
  const differences = specificationDifferences(left, right);
  const usefulFacts = comparisonFacts(left, right).filter((fact) => !fact.startsWith("There is not enough") && !fact.startsWith("The observed"));
  const related = Object.entries(pairMap).filter(([key, item]) => key !== pair && (item.leftSlug === left.slug || item.rightSlug === left.slug || item.leftSlug === right.slug || item.rightSlug === right.slug)).slice(0, 6);

  return (
    <>
      <SeoNavigation />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-6">
        <JsonLd data={comparisonStructuredData(left, right, [])} />
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground"><Link className="transition-colors hover:text-foreground" href="/">Home</Link><span className="px-2">/</span><Link className="transition-colors hover:text-foreground" href="/compare/">Compare</Link><span className="px-2">/</span><span className="text-foreground">{left.model_id} vs {right.model_id}</span></nav>

        <header className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/55 to-primary/5 p-6 shadow-sm backdrop-blur md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{left.model_type} comparison</p>
          <div className="mt-3 flex flex-wrap items-center gap-3"><ModelLogo model={left} size="lg" /><h1 className="text-3xl font-bold tracking-tight md:text-5xl">{left.model_id}<span className="px-3 text-muted-foreground">vs</span>{right.model_id}</h1><ModelLogo model={right} size="lg" /></div>
          <p className="mt-4 max-w-3xl text-muted-foreground">Compare the things that matter before you build: current price, capabilities, and latest aggregated LLM7 statistics.</p>
        </header>

        <div className="mt-8 grid gap-7 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start"><ModelDetailsCard model={left} title={left.model_id + " details"} /><ModelDetailsCard model={right} title={right.model_id + " details"} /></aside>
          <div className="space-y-8">
            <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Current pricing</p><h2 className="mt-2 text-2xl font-semibold">See the cost difference clearly</h2></div>{pricesDirectlyComparable(left, right) ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">Directly comparable</span> : null}</div>
              <div className="mt-5 grid gap-3 md:grid-cols-2"><PricingCard model={left} /><PricingCard model={right} /></div>
              {!pricesDirectlyComparable(left, right) ? <p className="mt-3 text-sm text-muted-foreground">These prices use different units, so compare them within the context of your workload.</p> : null}
            </section>

            {differences.length ? <section><div className="mb-5"><h2 className="text-2xl font-semibold">What&apos;s different</h2><p className="mt-1 text-sm text-muted-foreground">Only capabilities that differ between these models are listed. Green highlights the broader supported option or larger context window.</p></div><div className="space-y-3">{differences.map((difference) => <article key={difference.label} className="rounded-2xl border border-border/60 bg-card/55 p-4 shadow-sm backdrop-blur"><p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{difference.label}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className={"rounded-xl border p-3 " + (difference.better === "left" ? "border-emerald-500/35 bg-emerald-500/10" : "border-transparent bg-background/45")}><p className="text-xs text-muted-foreground">{left.model_id}{difference.better === "left" ? <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Better fit</span> : null}</p><p className="mt-1 text-sm font-semibold">{difference.left}</p></div><div className={"rounded-xl border p-3 " + (difference.better === "right" ? "border-emerald-500/35 bg-emerald-500/10" : "border-transparent bg-background/45")}><p className="text-xs text-muted-foreground">{right.model_id}{difference.better === "right" ? <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Better fit</span> : null}</p><p className="mt-1 text-sm font-semibold">{difference.right}</p></div></div></article>)}</div></section> : null}

            <StatisticsComparison left={left} right={right} />
            <ComparisonCharts modelType={left.model_type} leftName={left.model_id} rightName={right.model_id} leftPoints={leftEntry.metrics.points} rightPoints={rightEntry.metrics.points} />

            <section><div className="mb-5"><h2 className="text-2xl font-semibold">Estimate your workload</h2><p className="mt-1 text-sm text-muted-foreground">Try the same request volume against both public price lists.</p></div><div className="grid gap-5 xl:grid-cols-2"><ModelCalculator mode={left.pricing.mode} unit={left.pricing.unit} inputPrice={left.pricing.input} outputPrice={left.pricing.output} price={left.pricing.price} minimum={left.pricing.minimum_request_usd} durations={left.capabilities.supported_seconds} variablePricing={Boolean(left.pricing.route_prices_usd_per_second?.length)} /><ModelCalculator mode={right.pricing.mode} unit={right.pricing.unit} inputPrice={right.pricing.input} outputPrice={right.pricing.output} price={right.pricing.price} minimum={right.pricing.minimum_request_usd} durations={right.capabilities.supported_seconds} variablePricing={Boolean(right.pricing.route_prices_usd_per_second?.length)} /></div></section>

            {usefulFacts.length ? <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur"><h2 className="text-2xl font-semibold">Quick take</h2><ul className="mt-4 space-y-2">{usefulFacts.map((fact) => <li key={fact} className="rounded-xl border border-border/60 bg-background/45 px-3 py-3 text-sm">{fact}</li>)}</ul></section> : null}

            {related.length ? <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur"><h2 className="text-2xl font-semibold">Keep exploring</h2><div className="mt-4 grid gap-2 sm:grid-cols-2"><Link className="rounded-xl border border-border/60 bg-background/45 px-3 py-3 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5" href={modelPath(left.slug)}>About {left.model_id}</Link><Link className="rounded-xl border border-border/60 bg-background/45 px-3 py-3 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5" href={modelPath(right.slug)}>About {right.model_id}</Link>{related.map(([key, item]) => <Link key={key} className="rounded-xl border border-border/60 bg-background/45 px-3 py-3 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5" href={comparisonPath(item.leftSlug, item.rightSlug)}>{publicModels.find((model) => model.slug === item.leftSlug)?.model_id} vs {publicModels.find((model) => model.slug === item.rightSlug)?.model_id}</Link>)}</div></section> : null}
          </div>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
