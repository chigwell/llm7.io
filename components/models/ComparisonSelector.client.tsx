"use client";

import { useMemo, useState } from "react";

type ModelType = "chat" | "systemone" | "image" | "video";
type ModelOption = { slug: string; display_name: string; model_type: ModelType; status: "active" | "retired" };
const modelTypes: Array<{ value: ModelType; label: string }> = [
  { value: "chat", label: "Chat" },
  { value: "systemone", label: "System One" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];
export default function ComparisonSelector({ models }: { models: ModelOption[] }) {
  const [type, setType] = useState<ModelType>("chat");
  const eligible = useMemo(() => models.filter((model) => model.status === "active" && model.model_type === type), [models, type]);
  const [left, setLeft] = useState(""); const [right, setRight] = useState("");
  const submit = () => { if (!left || !right || left === right) return; const ordered = [left, right].sort((a, b) => a.localeCompare(b)); window.location.assign(`/compare/${ordered[0]}--vs--${ordered[1]}/`); };
  return <form className="mt-8 grid gap-4 rounded-2xl border border-border/60 bg-background/45 p-5 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); submit(); }}><label className="text-sm font-medium">Model type<select className="mt-2 w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50" value={type} onChange={(event) => { setType(event.target.value as ModelType); setLeft(""); setRight(""); }}>{modelTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="text-sm font-medium">First model<select className="mt-2 w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50" value={left} onChange={(event) => setLeft(event.target.value)}><option value="">Select a model</option>{eligible.map((model) => <option value={model.slug} key={model.slug}>{model.display_name}</option>)}</select></label><label className="text-sm font-medium">Second model<select className="mt-2 w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50" value={right} onChange={(event) => setRight(event.target.value)}><option value="">Select a model</option>{eligible.map((model) => <option disabled={model.slug === left} value={model.slug} key={model.slug}>{model.display_name}</option>)}</select></label><button type="submit" disabled={!left || !right || left === right} className="self-end rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">Compare models</button></form>;
}
