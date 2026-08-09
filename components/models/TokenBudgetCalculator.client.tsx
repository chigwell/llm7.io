"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Calculator, DollarSign, Search, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/buttonShadcn";
import { Input } from "@/components/ui/input";
import { modelPath } from "@/lib/models/routes";

export type CachedInputPriceKey = "cached_input" | "cache_read";

export type TokenBudgetModel = {
  modelId: string;
  slug: string;
  displayName: string;
  tier?: string | null;
  provider?: string | null;
  lightLogo?: string | null;
  darkLogo?: string | null;
  invertLogo?: boolean;
  contextTokens?: number | null;
  inputPrice: number;
  outputPrice: number;
  cachedInputPrice?: number | null;
  cachePriceKey?: CachedInputPriceKey | null;
  minimumCacheTokens?: number | null;
  unit: string;
  tokensPerUnit: number;
};

type CalculatedModel = TokenBudgetModel & {
  inputTokenShare: number;
  cachedInputTokenShare: number;
  uncachedInputTokens: number;
  cachedInputTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  uncachedInputCost: number;
  cachedInputCost: number;
  inputCost: number;
  outputCost: number;
  blendedPricePerMillion: number;
};

const INPUT_SHARE_MIN = 0.68;
const INPUT_SHARE_SPAN = 0.18;
const CACHED_INPUT_SHARE_MIN = 0.15;
const CACHED_INPUT_SHARE_SPAN = 0.55;

const compactFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  notation: "compact",
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 4,
});

function stableRatio(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

function sanitizeAmount(value: string): string {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [whole, ...fractions] = normalized.split(".");
  const wholePart = whole.slice(0, 9);
  const fraction = fractions.join("").slice(0, 4);

  return fractions.length ? `${wholePart || "0"}.${fraction}` : wholePart;
}

function parseAmount(value: string): number {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.min(amount, 1_000_000);
}

function formatTokens(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000_000) return compactFormatter.format(value);
  return integerFormatter.format(value);
}

function formatFullTokens(value: number): string {
  return Number.isFinite(value) ? integerFormatter.format(value) : "0";
}

function formatPrice(value: number): string {
  return Number.isFinite(value) ? usdFormatter.format(value) : "$0";
}

function modelInitial(modelId: string): string {
  return modelId.replace(/^[^a-z0-9]+/i, "").slice(0, 1).toUpperCase() || "M";
}

function hasCachedInputPrice(model: TokenBudgetModel): model is TokenBudgetModel & { cachedInputPrice: number } {
  return typeof model.cachedInputPrice === "number" && Number.isFinite(model.cachedInputPrice) && model.cachedInputPrice >= 0;
}

function cachePriceLabel(key: CachedInputPriceKey | null | undefined): string {
  return key === "cache_read" ? "Cache read" : "Cached input";
}

function ModelMark({ model }: { model: TokenBudgetModel }) {
  if (!model.lightLogo) {
    return (
      <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border/60 bg-background/60 text-sm font-semibold">
        {modelInitial(model.modelId)}
      </span>
    );
  }

  return (
    <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border/60 bg-background/60 shadow-sm" title={model.provider ?? undefined}>
      <Image src={model.lightLogo} alt={(model.provider || model.displayName) + " logo"} width={24} height={24} className={"max-h-6 w-auto max-w-6 object-contain " + (model.darkLogo ? "dark:hidden" : model.invertLogo ? "dark:invert" : "")} />
      {model.darkLogo ? <Image src={model.darkLogo} alt={(model.provider || model.displayName) + " logo"} width={24} height={24} className="hidden max-h-6 w-auto max-w-6 object-contain dark:block" /> : null}
    </span>
  );
}

function calculateModel(model: TokenBudgetModel, amount: number, seed: number): CalculatedModel {
  const jitter = stableRatio(`${model.modelId}:${seed}`);
  const inputTokenShare = INPUT_SHARE_MIN + jitter * INPUT_SHARE_SPAN;
  const cachedInputTokenShare = hasCachedInputPrice(model) ? CACHED_INPUT_SHARE_MIN + stableRatio(`${model.modelId}:cache:${seed}`) * CACHED_INPUT_SHARE_SPAN : 0;

  const calculateWithCacheShare = (cacheShare: number) => {
    const outputTokenShare = 1 - inputTokenShare;
    const uncachedInputShare = inputTokenShare * (1 - cacheShare);
    const cachedInputShare = inputTokenShare * cacheShare;
    const cachedInputUnitPrice = hasCachedInputPrice(model) ? model.cachedInputPrice : model.inputPrice;
    const blendedUnitPrice = uncachedInputShare * model.inputPrice + cachedInputShare * cachedInputUnitPrice + outputTokenShare * model.outputPrice;
    const totalTokens = blendedUnitPrice > 0 ? (amount * model.tokensPerUnit) / blendedUnitPrice : 0;
    const inputTokens = totalTokens * inputTokenShare;
    const cachedInputTokens = inputTokens * cacheShare;
    const uncachedInputTokens = inputTokens - cachedInputTokens;
    const outputTokens = totalTokens * outputTokenShare;
    const uncachedInputCost = (uncachedInputTokens / model.tokensPerUnit) * model.inputPrice;
    const cachedInputCost = (cachedInputTokens / model.tokensPerUnit) * cachedInputUnitPrice;

    return {
      ...model,
      inputTokenShare,
      cachedInputTokenShare: cacheShare,
      uncachedInputTokens,
      cachedInputTokens,
      inputTokens,
      outputTokens,
      totalTokens,
      uncachedInputCost,
      cachedInputCost,
      inputCost: uncachedInputCost + cachedInputCost,
      outputCost: (outputTokens / model.tokensPerUnit) * model.outputPrice,
      blendedPricePerMillion: (blendedUnitPrice / model.tokensPerUnit) * 1_000_000,
    };
  };

  const calculation = calculateWithCacheShare(cachedInputTokenShare);
  if (model.minimumCacheTokens && calculation.cachedInputTokens > 0 && calculation.cachedInputTokens < model.minimumCacheTokens) {
    return calculateWithCacheShare(0);
  }

  return calculation;
}

export default function TokenBudgetCalculator({ models }: { models: TokenBudgetModel[] }) {
  const [amountValue, setAmountValue] = useState("10");
  const [query, setQuery] = useState("");
  const [seed, setSeed] = useState(1);
  const amount = parseAmount(amountValue);

  const calculated = useMemo(() => {
    return models
      .map((model) => calculateModel(model, amount, seed))
      .sort((left, right) => right.totalTokens - left.totalTokens);
  }, [amount, models, seed]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return calculated;

    return calculated.filter((model) => {
      return [model.modelId, model.displayName, model.provider, model.tier].some((value) => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [calculated, query]);

  const bestValue = calculated[0];
  const medianValue = calculated[Math.floor(calculated.length / 2)];
  const cachePricedCount = models.filter(hasCachedInputPrice).length;

  return (
    <section aria-labelledby="token-budget-calculator" className="mt-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Calculator className="h-5 w-5" />
            </span>
            <div>
              <h2 id="token-budget-calculator" className="text-xl font-semibold">Budget input</h2>
              <p className="text-sm text-muted-foreground">Estimated text token volume for active token-priced models.</p>
            </div>
          </div>

          <label className="mt-6 block text-sm font-medium" htmlFor="usd-budget">
            Amount in USD
          </label>
          <div className="mt-2 flex overflow-hidden rounded-xl border border-border/70 bg-background/65 shadow-inner focus-within:ring-2 focus-within:ring-ring/50">
            <span className="grid w-12 place-items-center border-r border-border/70 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
            </span>
            <input
              id="usd-budget"
              inputMode="decimal"
              value={amountValue}
              onChange={(event) => setAmountValue(sanitizeAmount(event.target.value))}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-2xl font-semibold outline-none"
              aria-label="Amount in US dollars"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[1, 5, 10, 25, 100].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setAmountValue(String(preset))}
                className="rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                ${preset}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background/45 p-3">
              <p className="text-xs text-muted-foreground">Best model</p>
              <p className="mt-1 text-lg font-semibold">{bestValue ? formatTokens(bestValue.totalTokens) : "0"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/45 p-3">
              <p className="text-xs text-muted-foreground">Median model</p>
              <p className="mt-1 text-lg font-semibold">{medianValue ? formatTokens(medianValue.totalTokens) : "0"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/45 p-3">
              <p className="text-xs text-muted-foreground">Models counted</p>
              <p className="mt-1 text-lg font-semibold">{models.length}</p>
            </div>
          </div>

          <Button type="button" variant="outline" className="mt-5 w-full" onClick={() => setSeed((current) => current + 1)}>
            <Shuffle className="h-4 w-4" />
            Shuffle token/cache mix
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {cachePricedCount
              ? `${cachePricedCount} models expose cached-input pricing; their rows include cached-token estimates.`
              : "Cached-token estimates appear when a model exposes cached input or cache read pricing."}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/55 to-primary/5 p-5 shadow-sm backdrop-blur md:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Live estimate</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {bestValue ? formatTokens(bestValue.totalTokens) : "0"} tokens on the best-priced model
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            The budget is applied to each model independently. Each row uses a stable input/output token mix between 68/32 and 86/14. Models with cached-input pricing also get a cached-token share between 15% and 70% of input tokens.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {calculated.slice(0, 4).map((model) => (
              <Link key={model.slug} href={modelPath(model.slug)} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/45 p-3 transition-colors hover:border-primary hover:bg-primary/5">
                <ModelMark model={model} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{model.modelId}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTokens(model.totalTokens)} tokens
                    {hasCachedInputPrice(model) ? ` · ${Math.round(model.cachedInputTokenShare * 100)}% cached input` : ""}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/55 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 border-b border-border/60 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Text models</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sorted by estimated total tokens for {formatPrice(amount)}.</p>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search models" className="pl-9" aria-label="Search models" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-border/60 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Total tokens</th>
                <th className="px-4 py-3 font-medium">Uncached input</th>
                <th className="px-4 py-3 font-medium">Cached input</th>
                <th className="px-4 py-3 font-medium">Output</th>
                <th className="px-4 py-3 font-medium">Mix</th>
                <th className="px-4 py-3 font-medium">Blended price</th>
                <th className="px-4 py-3 font-medium">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((model) => (
                <tr key={model.slug} className="transition-colors hover:bg-background/45">
                  <td className="px-4 py-4">
                    <Link href={modelPath(model.slug)} className="flex items-center gap-3 underline-offset-4 hover:underline">
                      <ModelMark model={model} />
                      <span className="min-w-0">
                        <span className="block max-w-[260px] truncate font-medium">{model.modelId}</span>
                        <span className="text-xs text-muted-foreground">{[model.provider, model.tier].filter(Boolean).join(" · ") || model.unit}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-lg font-semibold">{formatTokens(model.totalTokens)}</td>
                  <td className="px-4 py-4">
                    <span className="block font-medium">{formatFullTokens(model.uncachedInputTokens)}</span>
                    <span className="text-xs text-muted-foreground">{formatPrice(model.uncachedInputCost)}</span>
                  </td>
                  <td className="px-4 py-4">
                    {hasCachedInputPrice(model) ? (
                      <>
                        <span className="block font-medium">{formatFullTokens(model.cachedInputTokens)}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(model.cachedInputCost)} · {cachePriceLabel(model.cachePriceKey)}
                          {model.minimumCacheTokens ? ` · min ${formatTokens(model.minimumCacheTokens)}` : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No cache price</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="block font-medium">{formatFullTokens(model.outputTokens)}</span>
                    <span className="text-xs text-muted-foreground">{formatPrice(model.outputCost)}</span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    <span className="block">{Math.round(model.inputTokenShare * 100)} / {Math.round((1 - model.inputTokenShare) * 100)}</span>
                    {hasCachedInputPrice(model) ? <span className="block text-xs">cache {Math.round(model.cachedInputTokenShare * 100)}% of input</span> : null}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{formatPrice(model.blendedPricePerMillion)} / 1M</td>
                  <td className="px-4 py-4 text-muted-foreground">{model.contextTokens ? formatTokens(model.contextTokens) : "Not listed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length ? <p className="border-t border-border/60 p-6 text-sm text-muted-foreground">No text models match this search.</p> : null}
      </div>
    </section>
  );
}
