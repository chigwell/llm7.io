"use client";
import { useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";
import { adsAttribution } from "@/lib/ads-attribution";

const PREFERENCES_EVENT = "llm7:analytics-preferences";

export function AnalyticsPreferences() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <button type="button" className="llm7-analytics-preferences-link" onClick={() => window.dispatchEvent(new window.Event(PREFERENCES_EVENT))}>Analytics preferences</button>;
}

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState("unknown");
  const [adsConsent, setAdsConsent] = useState("unknown");
  const [productAllowed, setProductAllowed] = useState(false);
  const [adsAllowed, setAdsAllowed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const consentSignature = useRef("");
  const banner = useRef(null);

  useEffect(() => {
    setMounted(true);
    const sync = (resetDraft = false) => {
      analytics.syncConsent();
      adsAttribution.syncConsent();
      const product = analytics.getConsent(), ads = adsAttribution.getConsent();
      const signature = `${product}:${ads}`;
      setConsent(product);
      setAdsConsent(ads);
      // Background checks must not overwrite choices the visitor is editing.
      if (resetDraft === true || consentSignature.current !== signature) {
        consentSignature.current = signature;
        setProductAllowed(product !== "declined");
        setAdsAllowed(ads !== "declined");
      }
    };
    const unsubscribe = analytics.subscribe(sync);
    const unsubscribeAds = adsAttribution.subscribe(sync);
    const stopAds = adsAttribution.start();
    const openPreferences = () => { sync(true); setPreferencesOpen(true); };
    sync();
    window.addEventListener(PREFERENCES_EVENT, openPreferences);
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);
    document.addEventListener("visibilitychange", sync);
    const interval = window.setInterval(sync, 1000);
    return () => {
      unsubscribe(); unsubscribeAds(); stopAds();
      window.removeEventListener(PREFERENCES_EVENT, openPreferences);
      window.clearInterval(interval);
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    const update = () => document.documentElement.style.setProperty("--llm7-analytics-height", banner.current ? banner.current.getBoundingClientRect().height + 16 + "px" : "0px");
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (banner.current) observer?.observe(banner.current);
    return () => { observer?.disconnect(); document.documentElement.style.removeProperty("--llm7-analytics-height"); };
  }, [consent, adsConsent, preferencesOpen, mounted]);

  if (!mounted) return null;
  const choose = (product, ads) => {
    if (analytics.enabled()) analytics.setConsent(product);
    adsAttribution.setConsent(ads);
    setConsent(analytics.getConsent());
    setAdsConsent(adsAttribution.getConsent());
    setPreferencesOpen(false);
  };
  if ((!analytics.enabled() || consent !== "unknown") && adsConsent !== "unknown" && !preferencesOpen) return null;
  return (
    <aside ref={banner} className="llm7-analytics-banner" aria-label="Analytics preferences">
      <div className="llm7-analytics-content">
        <strong>Privacy choices</strong>
        <div className="llm7-analytics-choices">
        {analytics.enabled() && <label className="llm7-analytics-choice">
          <input type="checkbox" checked={productAllowed} onChange={event => setProductAllowed(event.target.checked)} />
          <span>Product analytics</span>
        </label>}
        <label className="llm7-analytics-choice">
          <input type="checkbox" checked={adsAllowed} onChange={event => setAdsAllowed(event.target.checked)} />
          <span>Google & OpenAI ad measurement</span>
        </label>
        </div>
        <p>Optional analytics and ad measurement. Ad matching may use hashed email/customer IDs, browser identifiers, your IP address and browser details. Change anytime. <a href="https://llm7.io/privacy.html" target="_blank" rel="noreferrer">Privacy policy</a></p>
      </div>
      <div className="llm7-analytics-actions">
        <button type="button" onClick={() => choose(false, false)}>No thanks</button>
        <button type="button" onClick={() => choose(productAllowed, adsAllowed)}>Save preferences</button>
        <button type="button" aria-label="Close analytics preferences" onClick={() => choose(false, false)}>×</button>
      </div>
    </aside>
  );
}
