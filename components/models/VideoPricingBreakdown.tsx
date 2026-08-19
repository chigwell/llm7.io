import { isProviderQuotePricing, videoPriceOptions, type VideoPricing } from "@/lib/models/video-pricing";
import { cn } from "@/lib/utils";

function formatUsdPerSecond(value: string): string {
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })}/s`;
}

export default function VideoPricingBreakdown({
  pricing,
  compact = false,
  className,
}: {
  pricing: VideoPricing;
  compact?: boolean;
  className?: string;
}) {
  if (isProviderQuotePricing(pricing)) return null;
  const options = videoPriceOptions(pricing);
  if (!options.length) return null;

  return (
    <div className={cn(compact ? "mt-3" : "mt-5", className)}>
      <p className={cn("font-medium uppercase tracking-[0.08em] text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>Price options</p>
      <div className={cn("mt-2 grid", compact ? "gap-1.5" : "gap-2 sm:grid-cols-2")}>
        {options.map((option) => (
          <div key={`${option.label}-${option.price}`} className={cn("flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-background/60", compact ? "px-2 py-1.5 text-[11px]" : "p-3 text-sm")}>
            <span className="text-muted-foreground">{option.label}</span>
            <span className="shrink-0 font-semibold">{formatUsdPerSecond(option.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
