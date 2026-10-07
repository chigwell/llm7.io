"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { openAiPixel } from "@/lib/openai-pixel";
import { analytics } from "@/lib/analytics";
import { trackLandingLink } from "@/lib/analytics-links";

export default function AnalyticsLifecycle() {
  const pathname = usePathname();
  useEffect(() => {
    const page = () => { openAiPixel.pageViewed(pathname); analytics.trackPageView(); };
    const unsubscribe = analytics.subscribe(page);
    page();
    window.addEventListener("popstate", page);
    return () => { unsubscribe(); window.removeEventListener("popstate", page); };
  }, [pathname]);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      try {
        const element = event.target instanceof Element ? event.target.closest("a[href]") : null;
        if (element) trackLandingLink(element, window.location.href);
      } catch { /* Analytics must never interfere with links. */ }
    };
    document.addEventListener("click", click, { passive: true });
    return () => document.removeEventListener("click", click);
  }, []);
  return null;
}
