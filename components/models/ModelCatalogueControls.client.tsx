"use client";

import { useEffect, useId, useState } from "react";

const filters = [
  ["type", "Model type", ["chat", "image", "video"]], ["tier", "Tier", []], ["status", "Status", ["active", "retired"]], ["input", "Input modality", ["text", "image"]], ["output", "Output modality", ["text", "image", "video"]],
  ["tools", "Tool calling", ["true", "false"]], ["reasoning", "Reasoning", ["true", "false"]], ["json", "JSON mode", ["true", "false"]], ["stream", "Streaming", ["true", "false"]],
] as const;

export default function ModelCatalogueControls({ tiers }: { tiers: string[] }) {
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const apply = (next: Record<string, string>) => {
    document.querySelectorAll<HTMLElement>("[data-model-card]").forEach((card) => {
      const name = card.dataset.name ?? "";
      const matches = Object.entries(next).every(([key, value]) => !value || (key === "search" ? name.includes(value.toLowerCase()) : (card.dataset[key] ?? "").split(" ").includes(value)));
      card.hidden = !matches;
    });
    window.history.replaceState({}, "", "/models/");
  };
  useEffect(() => { apply(values); }, []); // initial list is always rendered before hydration
  const update = (key: string, value: string) => { const next = { ...values, [key]: value }; setValues(next); apply(next); };
  const sort = (value: string) => {
    const container = document.querySelector("[data-model-list]");
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-model-card]"));
    cards.sort((left, right) => (left.dataset[value] ?? "").localeCompare(right.dataset[value] ?? "", undefined, { numeric: true }));
    cards.forEach((card) => container.appendChild(card));
    window.history.replaceState({}, "", "/models/");
  };
  return <form className="mb-8 grid gap-4 rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur md:grid-cols-4" onSubmit={(event) => event.preventDefault()} aria-label="Filter the model catalogue">
    <label className="text-sm font-medium md:col-span-2" htmlFor={`${id}-search`}>Search models<input id={`${id}-search`} placeholder="Search by model name" className="mt-2 w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/50" onChange={(event) => update("search", event.target.value)} /></label>
    {filters.map(([key, label, options]) => <label className="text-sm font-medium" key={key}>{label}<select className="mt-2 w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/50" defaultValue="" onChange={(event) => update(key, event.target.value)}><option value="">Any</option>{(key === "tier" ? tiers : options).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}
    <label className="text-sm font-medium">Sort order<select className="mt-2 w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/50" defaultValue="name" onChange={(event) => sort(event.target.value)}><option value="name">Display name</option><option value="price">Current price</option><option value="context">Context size</option><option value="success">30-day stability</option><option value="latency">30-day p95 latency</option><option value="updated">Updated date</option></select></label>
  </form>;
}
