"use client";

// Token flow animation component, 2026 by Timur Gabdullin: http://t.me/gabdullintimur
import dynamic from "next/dynamic";

const LiveUsageFlow = dynamic(
  () => import("@/components/live-usage-flow/LiveUsageFlow"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[640px] w-full items-center justify-center bg-muted/40 text-sm text-muted-foreground">
        Loading live flow...
      </div>
    ),
  }
);

export default function LiveUsageFlowSection() {
  return (
    <section className="relative w-full py-14 sm:py-16" aria-labelledby="live-api-flow-title">
      <div className="mx-auto flex w-full max-w-none flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Live traffic
          </p>
          <h2 id="live-api-flow-title" className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            API requests moving through LLM7.io
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            A rolling 60-second view of active clients, routing, model health, requests, and token volume.
          </p>
        </div>

        <div
          className="h-[720px] w-full overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-auto rounded-lg border border-border/60 bg-background/40 shadow-sm md:h-auto md:overflow-hidden md:overscroll-auto"
          data-live-flow-scroll
        >
          <div className="min-h-[720px] min-w-[960px] w-full md:min-h-[640px] md:min-w-0">
            <LiveUsageFlow />
          </div>
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Prompt and completion tokens are shown separately. The display updates every second from the public API.{" "}
          <a
            href="https://status.llm7.io/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
          >
            View detailed real-time statistics
          </a>
          .
        </p>
      </div>
    </section>
  );
}
