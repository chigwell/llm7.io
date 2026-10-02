"use client";
import { useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";

const PREFERENCES_EVENT = "llm7:analytics-preferences";

export function AnalyticsPreferences() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !analytics.enabled()) return null;
  return <button type="button" className="llm7-analytics-preferences-link" onClick={() => window.dispatchEvent(new window.Event(PREFERENCES_EVENT))}>Analytics preferences</button>;
}

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState("unknown");
  const [mounted, setMounted] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const banner = useRef(null);

  useEffect(() => {
    setMounted(true);
    const sync = () => { analytics.syncConsent(); setConsent(analytics.getConsent()); };
    const unsubscribe = analytics.subscribe(sync);
    const openPreferences = () => setPreferencesOpen(true);
    sync();
    window.addEventListener(PREFERENCES_EVENT, openPreferences);
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);
    document.addEventListener("visibilitychange", sync);
    const interval = window.setInterval(sync, 1000);
    return () => {
      unsubscribe();
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
  }, [consent, preferencesOpen, mounted]);

  if (!mounted || !analytics.enabled()) return null;
  const choose = allowed => {
    analytics.setConsent(allowed);
    setConsent(analytics.getConsent());
    setPreferencesOpen(false);
  };
  if (consent !== "unknown" && !preferencesOpen) {
    return null;
  }
  return (
    <aside ref={banner} className="llm7-analytics-banner" aria-label="Analytics preferences">
      <div>
        <strong>Help us improve LLM7</strong>
        <p>Allow optional analytics cookies to understand feature use and checkout interactions, including selected top-up amounts, across LLM7.io and the dashboard. Signed-in activity uses an account ID.</p>
        <a href="https://github.com/chigwell/llm7.io/blob/main/PRIVACY.md" target="_blank" rel="noreferrer">Privacy policy</a>
      </div>
      <div className="llm7-analytics-actions">
        <button type="button" onClick={() => choose(false)}>No thanks</button>
        <button type="button" onClick={() => choose(true)}>Allow analytics</button>
        <button type="button" aria-label="Close analytics preferences" onClick={() => choose(false)}>×</button>
      </div>
    </aside>
  );
}
