export default function ProviderQuotePricing({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <p className="mt-2 text-xs text-muted-foreground">Billed at actual provider cost with no LLM7 markup.</p>;
  }

  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm md:p-6">
      <h2 className="text-2xl font-semibold">Dynamic pricing</h2>
      <p className="mt-2 text-sm text-muted-foreground">The final price is quoted for each request from its parameters and actual provider usage. LLM7 charges the resulting provider cost with no markup.</p>
    </section>
  );
}
