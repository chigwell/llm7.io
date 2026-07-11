"use client";

import { useState } from "react";

const REFERRAL_KEY = "llm7_referral_code";
const REFERRAL_MAX_AGE = 60 * 60 * 24 * 30;

function validCode(value: string | null): value is string {
  return Boolean(value && /^[0-9A-Za-z]{1,32}$/.test(value));
}

function clearQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete("r");
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

export default function ReferralAttributionConsent() {
  const [code, setCode] = useState(() => typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("r"));
  const [confirmDecline, setConfirmDecline] = useState(false);
  if (!validCode(code)) return null;

  const decide = (accept: boolean) => {
    if (accept && !localStorage.getItem(REFERRAL_KEY)) {
      localStorage.setItem(REFERRAL_KEY, code);
      document.cookie = `${REFERRAL_KEY}=${encodeURIComponent(code)}; Domain=llm7.io; Path=/; Max-Age=${REFERRAL_MAX_AGE}; Secure; SameSite=Lax`;
    }
    clearQuery();
    setCode(null);
  };

  return (
    <aside className="fixed inset-x-0 bottom-0 z-[100] flex justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" role="region" aria-label="Referral attribution">
      <section className="w-full max-w-3xl rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur md:flex md:items-center md:justify-between md:gap-6 md:px-5">
        <div>
          <h2 className="text-sm font-semibold">Referral Programme</h2>
          <p className="mt-1 text-sm text-muted-foreground">Get a 20% bonus on your first balance top-up. Save this invite for 30 days and we will apply the bonus automatically when you create a new LLM7 account.</p>
        </div>
        <div className="mt-4 flex justify-end gap-3 md:mt-0">
          <button className="rounded-md border px-3 py-2 text-sm" onClick={() => setConfirmDecline(true)}>No thanks</button>
          <button className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={() => decide(true)}>Allow referral attribution</button>
        </div>
      </section>
      {confirmDecline ? (
        <div className="fixed inset-0 z-[101] grid place-items-center bg-black/50 p-5" role="dialog" aria-modal="true" aria-labelledby="referral-decline-title">
          <section className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <h2 id="referral-decline-title" className="text-lg font-semibold">Are you sure?</h2>
            <p className="mt-3 text-sm text-muted-foreground">You will not receive the 20% bonus on your first successful balance top-up.</p>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button className="rounded-md border px-3 py-2 text-sm" onClick={() => decide(true)}>Keep my bonus</button>
              <button className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700" onClick={() => decide(false)}>I don&apos;t need the 20% bonus</button>
            </div>
          </section>
        </div>
      ) : null}
    </aside>
  );
}
