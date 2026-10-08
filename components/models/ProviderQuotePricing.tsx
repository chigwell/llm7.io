export default function ProviderQuotePricing({ modelId, compact = false }: { modelId: string; compact?: boolean }) {
  if (compact) {
    return <p className="mt-2 text-xs text-muted-foreground">Dynamic pricing; billed at actual provider cost with no LLM7 markup.</p>;
  }

  return (
    <section aria-label={`${modelId} usage-based pricing`} className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm md:p-6">
      <h2 className="text-2xl font-semibold">Dynamic per-request quote</h2>
      <p className="mt-2 text-sm text-muted-foreground">The final charge is determined by request parameters and actual provider usage. LLM7 charges the resulting provider cost with no markup.</p>
    </section>
  );
}
