"use client";

import { useEffect, useId, useState } from "react";
import { useLivePrices } from "@/hooks/use-llm7-models";
import { PricingStatus } from "./LiveModelPricing.client";
import { parseTokenPricingUnit } from "@/lib/models/format";
import { modelTypeLabel } from "@/lib/models/model-types";

const filters = [
  ["type", "Model type", ["chat", "systemone", "image", "video", "audio_to_text"]], ["tier", "Tier", []], ["status", "Status", ["active", "retired"]], ["input", "Input modality", ["text", "json", "image", "audio"]], ["output", "Output modality", ["text", "json", "image", "video"]],
  ["tools", "Tool calling", ["true", "false"]], ["reasoning", "Reasoning", ["true", "false"]], ["json", "JSON mode", ["true", "false"]], ["stream", "Streaming", ["true", "false"]],
] as const;

export default function ModelCatalogueControls({ tiers }: { tiers: string[] }) {
  const id = useId();
  const { prices, state } = useLivePrices();
  const [sortOrder, setSortOrder] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const apply = (next: Record<string, string>) => {
    document.querySelectorAll<HTMLElement>("[data-model-card]").forEach((card) => {
      const name = card.dataset.name ?? "";
      const matches = Object.entries(next).every(([key, value]) => !value || (key === "search" ? name.includes(value.toLowerCase()) : (card.dataset[key] ?? "").split(" ").includes(value)));
      card.hidden = !matches;
    });
    window.history.replaceState({}, "", "/models/");
  };
  useEffect(() => { apply(values); }, [values]); // initial list is always rendered before hydration
  const update = (key: string, value: string) => { const next = { ...values, [key]: value }; setValues(next); apply(next); };
  useEffect(() => {
    if (!sortOrder) return;
    const container = document.querySelector("[data-model-list]");
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-model-card]"));
    const currentPrice = (card: HTMLElement) => {
      const p = prices.get(card.dataset.modelId ?? "")?.pricing;
      if (!p || p.billing_strategy === "provider_quote") return Infinity;
      const value = p.mode === "token" ? p.input : p.price;
      const unit = p.mode === "token" ? Number(parseTokenPricingUnit(p.unit)?.toString()) : 1;
      return value !== undefined && unit > 0 ? Number(value) / unit : Infinity;
    };
    cards.sort((left, right) => {
      if (sortOrder === "price") {
        const a = currentPrice(left), b = currentPrice(right);
        return (a === b ? 0 : a < b ? -1 : 1) || (left.dataset.name ?? "").localeCompare(right.dataset.name ?? "");
      }
      return (left.dataset[sortOrder] ?? "").localeCompare(right.dataset[sortOrder] ?? "", undefined, { numeric: true });
    });
    cards.forEach(card => container.appendChild(card));
  }, [sortOrder, prices]);
  return <form className="mb-8 grid gap-4 rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur md:grid-cols-4" onSubmit={(event) => event.preventDefault()} aria-label="Filter the model catalogue">
    <label className="text-sm font-medium md:col-span-2" htmlFor={`${id}-search`}>Search models<input id={`${id}-search`} placeholder="Search by model name" className="mt-2 w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/50" onChange={(event) => update("search", event.target.value)} /></label>
    {filters.map(([key, label, options]) => <label className="text-sm font-medium" key={key}>{label}<select className="mt-2 w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/50" defaultValue="" onChange={(event) => update(key, event.target.value)}><option value="">Any</option>{(key === "tier" ? tiers : options).map((option) => <option key={option} value={option}>{key === "type" ? modelTypeLabel(option) : option}</option>)}</select></label>)}
    <label className="text-sm font-medium">Sort order<select className="mt-2 w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/50" value={sortOrder || "name"} onChange={(event) => setSortOrder(event.target.value)}><option value="name">Display name</option><option value="price">Current price</option><option value="context">Context size</option><option value="success">30-day stability</option><option value="latency">30-day p95 latency</option><option value="updated">Updated date</option></select></label>
    {state !== "ready" ? <div className="md:col-span-4"><PricingStatus state={state} /></div> : null}
  </form>;
}
