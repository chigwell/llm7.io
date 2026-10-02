"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { analytics } from "@/lib/analytics";
import { sanitizeRoute } from "@/lib/analytics-core";

type GtagFunction = (...args: unknown[]) => void;
declare global { interface Window { gtag?: GtagFunction; } }
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-BRTLYQ3570";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const sync = () => {
      const consent = analytics.getConsent() === "allowed";
      (window as unknown as Record<string, unknown>)["ga-disable-" + GA_MEASUREMENT_ID] = !consent;
      setAllowed(consent);
    };
    const unsubscribe = analytics.subscribe(sync);
    sync();
    return unsubscribe;
  }, []);
  useEffect(() => {
    if (!allowed) return;
    const route = sanitizeRoute("landing", { pathname });
    window.gtag?.("event", "page_view", {
      page_path: route, page_location: "https://llm7.io" + route, page_referrer: "",
    });
  }, [pathname, allowed]);
  if (!allowed) return null;
  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
    <Script id="ga-init" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false, page_location: 'https://llm7.io/', page_referrer: '' });
      gtag('event', 'page_view', { page_path: window.location.pathname, page_location: 'https://llm7.io' + window.location.pathname, page_referrer: '' });
    `}</Script>
  </>;
}
