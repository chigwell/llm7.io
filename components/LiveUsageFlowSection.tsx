"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

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

const MOBILE_SCROLL_BREAKPOINT = 768;

export default function LiveUsageFlowSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const timers: number[] = [];

    const alignMobilePreviewRight = () => {
      const scroller = scrollRef.current;
      if (!scroller || window.innerWidth >= MOBILE_SCROLL_BREAKPOINT) return;
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      if (maxScrollLeft > 0) {
        scroller.scrollLeft = maxScrollLeft;
      }
    };

    const scheduleAlign = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(alignMobilePreviewRight);
    };

    scheduleAlign();
    timers.push(window.setTimeout(alignMobilePreviewRight, 120));
    timers.push(window.setTimeout(alignMobilePreviewRight, 600));

    window.addEventListener("resize", scheduleAlign);
    window.addEventListener("orientationchange", scheduleAlign);
    window.visualViewport?.addEventListener("resize", scheduleAlign);

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", scheduleAlign);
      window.removeEventListener("orientationchange", scheduleAlign);
      window.visualViewport?.removeEventListener("resize", scheduleAlign);
    };
  }, []);

  return (
    <section className="relative w-full py-14 sm:py-16" aria-labelledby="live-api-flow-title">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
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
          ref={scrollRef}
          className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-lg border border-border/60 bg-background/40 shadow-sm [-webkit-overflow-scrolling:touch] md:overflow-hidden"
          data-live-flow-scroll
        >
          <div className="min-h-[720px] min-w-[760px] w-full md:min-h-[760px] md:min-w-0">
            <LiveUsageFlow />
          </div>
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Each moving dot represents one token in the live flow.
        </p>
      </div>
    </section>
  );
}
