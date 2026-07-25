import type { PublicModel } from "@/lib/models/api-types";
import { formatContext } from "@/lib/models/format";
import ModelLogo from "./ModelLogo";

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-xs font-medium">{children}</span>;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="border-b border-border/50 py-3 last:border-b-0"><dt className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</dt><dd className="mt-1 text-sm">{children}</dd></div>;
}

export function capabilityLabels(model: PublicModel) {
  return [
    model.modalities.input.includes("text") ? "Text input" : null,
    model.modalities.input.includes("image") || model.capabilities.vision ? "Vision" : null,
    model.tools_calling || model.capabilities.tools ? "Tools" : null,
    model.stream || model.capabilities.stream ? "Streaming" : null,
    model.json_mode || model.capabilities.json_mode ? "JSON mode" : null,
    model.reasoning || model.capabilities.reasoning ? "Reasoning" : null,
    model.capabilities.image_generation ? "Image generation" : null,
    model.capabilities.image_edits ? "Image editing" : null,
    model.capabilities.video_generation ? "Video generation" : null,
  ].filter((value): value is string => Boolean(value));
}

export default function ModelDetailsCard({ model, title = "Model details" }: { model: PublicModel; title?: string }) {
  const capabilities = capabilityLabels(model);
  const mediaDetails = [
    model.capabilities.supported_sizes?.length ? "Sizes: " + model.capabilities.supported_sizes.join(", ") : null,
    model.capabilities.supported_seconds?.length ? "Durations: " + model.capabilities.supported_seconds.map((item) => item + "s").join(", ") : null,
    model.capabilities.max_reference_images ? "Up to " + model.capabilities.max_reference_images + " reference images" : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <section className="rounded-2xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur" aria-label={title}>
      <div className="flex items-start gap-3"><ModelLogo model={model} size="sm" /><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">At a glance</p><h2 className="mt-1 text-xl font-semibold">{title}</h2></div></div>
      <dl className="mt-3">
        <Detail label="Type">{model.model_type}</Detail>
        {model.tier ? <Detail label="Tier">{model.tier}</Detail> : null}
        {model.context_window.tokens ? <Detail label="Context">{formatContext(model.context_window.tokens)}</Detail> : null}
        {model.modalities.output.length ? <Detail label="Output">{model.modalities.output.join(", ")}</Detail> : null}
        {mediaDetails.length ? <Detail label="Options">{mediaDetails.join(" · ")}</Detail> : null}
        <Detail label="API">{model.api_interfaces.map((api) => api.operation.replace(".", " ")).join(", ")}</Detail>
      </dl>
      {capabilities.length ? <div className="mt-4"><p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Capabilities</p><div className="mt-2 flex flex-wrap gap-1.5">{capabilities.map((capability) => <Badge key={capability}>{capability}</Badge>)}</div></div> : null}
    </section>
  );
}
