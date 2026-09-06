"use client";
import { Sparkles } from "lucide-react";
import { Pill } from "./ui/pill";
import { usePingMetrics } from "@/hooks/use-ping-metrics";
import { createStatusFromSnapshot } from "@/lib/hero-metrics";

export function HeroStatusPill() {
  const { latest, error } = usePingMetrics();
  const status = createStatusFromSnapshot(latest, error);

  return (
    <Pill
      icon={<Sparkles className="w-3 h-3 md:w-4 md:h-4" />}
      status={status.status}
      variant="outline"
      className="mb-6 md:mb-8 bg-background/70 backdrop-blur-sm text-xs md:text-sm text-muted-foreground"
      title={status.detail}
      aria-label={`${status.label}. ${status.detail}`}
    >
      {status.label}
    </Pill>
  );
}

