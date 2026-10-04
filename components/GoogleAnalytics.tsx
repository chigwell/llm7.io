"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sanitizeRoute } from "@/lib/analytics-core";

type GtagFunction = (...args: unknown[]) => void;
declare global { interface Window { gtag?: GtagFunction; } }
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-BRTLYQ3570";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);
  const lastPageView = useRef<string | null>(null);
  useEffect(() => {
    if (!initialized || !window.gtag) return;
    const route = sanitizeRoute("landing", { pathname });
    if (lastPageView.current === route) return;
    lastPageView.current = route;
    window.gtag("event", "page_view", {
      page_path: route, page_location: "https://llm7.io" + route, page_referrer: "",
    });
  }, [pathname, initialized]);
  // Google Analytics runs independently of the optional PostHog consent choice.
  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
    <Script id="ga-init" strategy="afterInteractive" onReady={() => setInitialized(true)}>{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false, page_location: 'https://llm7.io/', page_referrer: '' });
    `}</Script>
  </>;
}
