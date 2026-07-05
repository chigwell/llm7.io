"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/buttonShadcn";
import { ArrowRightIcon, GiftIcon, SparklesIcon, XIcon } from "lucide-react";

export default function PromoBanner() {
  const [revealed, setRevealed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const recordClick = useCallback((source: number) => {
    const url = `https://api.llm7.io/record-click?source=${source}`;
    try {
      fetch(url, { method: "GET", keepalive: true, mode: "no-cors" }).catch(() => {});
    } catch {
      // Swallow errors to avoid impacting UX
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!revealed || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6">
      <div className="w-full max-w-5xl rounded-xl border border-border/70 bg-background/95 shadow-2xl backdrop-blur-xl">
        <div className="relative flex flex-col gap-4 px-4 py-4 pr-14 sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-4 sm:pr-16">
          <button
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => {
              setDismissed(true);
              recordClick(3);
            }}
            aria-label="Close promotion"
          >
            <XIcon className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="rounded-lg border border-border/60 bg-secondary/60 p-3 shadow-sm">
              <GiftIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/50 px-3 py-1 text-xs font-medium">
                <SparklesIcon className="h-3.5 w-3.5 text-primary" />
                <span className="promo-shimmer-text">Limited Stripe top-up bonus</span>
              </div>
              <p className="text-sm font-semibold leading-6 text-foreground sm:text-base">
                Until June 7, 2026 at 23:59 London time, Stripe balance top-ups from $30 are doubled
                on llm7.io.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                For example, top up $50 and $100 will be credited to your llm7.io account balance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:mr-8 sm:self-center">
            <Button
              asChild
              className="w-full sm:w-auto"
              onClick={() => recordClick(2)}
            >
              <a href="https://dash.llm7.io/" target="_blank" rel="noreferrer">
                Top up balance
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
