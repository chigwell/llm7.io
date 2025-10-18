"use client";

import React from "react";
import { Pill, PillProps } from "@/components/ui/pill";
import { Icons } from "@/components/ui/Icons";


export function VuiPill(props: PillProps) {
  return <Pill {...props} />;
}

export function PillShowcase() {
  const variants: Array<NonNullable<PillProps["variant"]>> = [
    "default",
    "secondary",
    "success",
    "warning",
    "error",
    "info",
    "outline",
  ];

  const statuses: Array<NonNullable<PillProps["status"]>> = [
    "none",
    "active",
    "inactive",
    "warning",
    "error",
    "info",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Pill Component
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lightweight labels &amp; status indicators – with variants, sizes and optional icons.
          </p>
        </div>

        {/* Variant grid */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-center">Variants</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {variants.map((variant) => {
              const variantEmoji: Record<string, string> = {
                default: "🏷️",
                secondary: "📌",
                success: "✅",
                warning: "⚠️",
                error: "❌",
                info: "ℹ️",
                outline: "🔲",
              };

              return (
                <VuiPill
                  key={variant}
                  variant={variant as PillProps["variant"]}
                  icon={<span role="img" aria-label={variant}>{variantEmoji[variant]}</span>}
                >
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </VuiPill>
              );
            })}
          </div>
        </section>

        {/* Status indicators */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-center">Statuses</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {statuses.map((status) => {
              const statusEmoji: Record<string, string> = {
                none: "🏷️",
                active: "🟢",
                inactive: "⚪",
                warning: "⚠️",
                error: "🔴",
                info: "ℹ️",
              };

              return (
                <VuiPill
                  key={status}
                  status={status as PillProps["status"]}
                  icon={<span role="img" aria-label={status}>{statusEmoji[status]}</span>}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </VuiPill>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export function PillTheme() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <VuiPill icon={<span role="img" aria-label="label">🏷️</span>}>Default</VuiPill>
      <VuiPill variant="success" status="active" icon={<Icons.gitHub className="w-4 h-4" />}>
        Deployed
      </VuiPill>
      <VuiPill variant="warning" status="warning" icon={<Icons.twitter className="w-4 h-4" />}>
        Pending
      </VuiPill>
      <VuiPill variant="error" status="error" icon={<Icons.npm className="w-4 h-4" />}>
        Failed
      </VuiPill>
    </div>
  );
}

