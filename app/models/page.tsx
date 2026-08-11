import type { Metadata } from "next";
import Link from "next/link";
import ModelCatalogueControls from "@/components/models/ModelCatalogueControls.client";
import CopyModelId from "@/components/models/CopyModelId.client";
import { capabilityLabels } from "@/components/models/ModelDetailsCard";
import ModelLogo from "@/components/models/ModelLogo";
import ModelUsagePieChart, { type ModelUsageDatum } from "@/components/models/ModelUsagePieChart.client";
import { JsonLd, SeoFooter, SeoNavigation } from "@/components/models/SeoChrome";
import { formatCachePrice, formatContext, formatMs, formatPrice, formatRate } from "@/lib/models/format";
import { publicModels } from "@/lib/models/snapshot";
import { modelPath } from "@/lib/models/routes";
import { siteStructuredData } from "@/lib/models/structured-data";

export const metadata: Metadata = {
  title: "AI Model API Catalogue, Pricing and Latest Statistics | LLM7",
  description: "Browse public LLM7 API models with current pricing, published capabilities, and latest aggregated LLM7 statistics.",
  alternates: { canonical: "https://llm7.io/models/" },
  robots: { index: true, follow: true },
  openGraph: { title: "AI Model API Catalogue, Pricing and Latest Statistics | LLM7", description: "Public LLM7 API model pricing, capabilities, and latest aggregated statistics.", url: "https://llm7.io/models/", images: [{ url: "https://llm7.io/generated/og/model-comparison.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["https://llm7.io/generated/og/model-comparison.png"] },
};

function ModelCard({ model }: { model: (typeof publicModels)[number] }) {
  const stats = model.statistics?.["30d"];
  const price = model.pricing.mode === "token" ? model.pricing.input ?? "" : model.pricing.price ?? "";
  const cachePrice = formatCachePrice(model);
  const capabilities = capabilityLabels(model).slice(0, 4);
  const statisticCards = [
    stats?.success_rate !== null && stats?.success_rate !== undefined ? ["Stability", formatRate(stats.success_rate)] : null,
    stats?.latency_observations ? ["P95 latency", formatMs(stats.latency_p95_ms)] : null,
  ].filter((item): item is [string, string] => Boolean(item));

  return (
    <article data-model-card data-name={(model.display_name + " " + model.model_id).toLowerCase()} data-type={model.model_type} data-tier={model.tier ?? ""} data-status={model.status} data-input={model.modalities.input.join(" ")} data-output={model.modalities.output.join(" ")} data-tools={String(Boolean(model.tools_calling))} data-reasoning={String(Boolean(model.reasoning))} data-json={String(Boolean(model.json_mode))} data-stream={String(Boolean(model.stream))} data-price={price} data-context={String(model.context_window.tokens ?? 0)} data-success={String(stats?.success_rate ?? -1)} data-latency={String(stats?.latency_p95_ms ?? Number.MAX_SAFE_INTEGER)} data-updated={model.updated_at} className="group rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3"><ModelLogo model={model} size="sm" /><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{model.model_type}{model.tier ? " · " + model.tier : ""}</p><h2 className="mt-2 text-xl font-semibold"><Link href={modelPath(model.slug)} className="underline-offset-4 group-hover:underline">{model.model_id}</Link></h2></div></div>
        <span className={"rounded-full px-2.5 py-1 text-xs font-medium " + (model.status === "active" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300")}>{model.status === "active" ? "Available" : "Retired"}</span>
      </div>
      <div className="mt-4 flex items-center gap-2"><code className="min-w-0 truncate rounded-lg bg-background/60 px-2 py-1 text-xs">{model.model_id}</code><CopyModelId modelId={model.model_id} /></div>
      <p className="mt-4 text-sm font-medium">{formatPrice(model)}</p>
      {cachePrice ? <p className="mt-1 text-xs text-muted-foreground">Cache: {cachePrice}</p> : null}
      {model.context_window.tokens ? <p className="mt-2 text-sm text-muted-foreground">{formatContext(model.context_window.tokens)} context</p> : null}
      {capabilities.length ? <div className="mt-4 flex flex-wrap gap-1.5">{capabilities.map((capability) => <span key={capability} className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-xs">{capability}</span>)}</div> : null}
      {statisticCards.length ? <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/50 pt-4 text-xs">{statisticCards.map(([label, value]) => <p key={label}><span className="block text-muted-foreground">{label}</span><span className="font-medium">{value}</span></p>)}</div> : null}
    </article>
  );
}

export default function ModelsPage() {
  const active = publicModels.filter((model) => model.status === "active");
  const retired = publicModels.filter((model) => model.status === "retired");
  const counts = (["chat", "image", "video"] as const).map((type) => [type, active.filter((model) => model.model_type === type).length] as const);
  const tiers = [...new Set(publicModels.map((model) => model.tier).filter((tier): tier is string => Boolean(tier)))].sort();
  const usageShare: ModelUsageDatum[] = publicModels.map((model) => ({
    modelId: model.model_id,
    requests: model.statistics?.all?.requests_total ?? 0,
    slug: model.slug,
  }));

  return (
    <>
      <SeoNavigation />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-6">
        <JsonLd data={siteStructuredData()} />
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground"><Link className="transition-colors hover:text-foreground" href="/">Home</Link><span className="px-2">/</span><span className="text-foreground">Models</span></nav>
        <header className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/55 to-primary/5 p-6 shadow-sm backdrop-blur md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">LLM7 model catalogue</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Find the right model for your build.</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">Explore available chat, image, and video models with their pricing and capabilities in one place.</p>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-xl">{counts.map(([type, count]) => <div key={type} className="rounded-xl border border-border/60 bg-background/45 p-3"><p className="text-xs capitalize text-muted-foreground">{type}</p><p className="mt-1 text-2xl font-semibold">{count}</p></div>)}</div>
        </header>

        <section className="mt-8" aria-labelledby="active-models">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 id="active-models" className="text-2xl font-semibold">Available models</h2><p className="mt-1 text-sm text-muted-foreground">Use filters to narrow the list to the capabilities you need.</p></div><Link className="rounded-lg border border-border/70 bg-card/55 px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent" href="/compare/">Compare models</Link></div>
          <ModelCatalogueControls tiers={tiers} />
          <div data-model-list className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{active.map((model) => <ModelCard key={model.slug} model={model} />)}</div>
        </section>

        {retired.length ? <section className="mt-12" aria-labelledby="retired-models"><h2 id="retired-models" className="text-2xl font-semibold">Retired models</h2><p className="mt-1 text-sm text-muted-foreground">Listed for reference only; they are no longer available through LLM7.</p><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{retired.map((model) => <ModelCard key={model.slug} model={model} />)}</div></section> : null}
        <ModelUsagePieChart data={usageShare} />
      </main>
      <SeoFooter />
    </>
  );
}
