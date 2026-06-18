"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/buttonShadcn";
import { CheckIcon, CopyIcon, GiftIcon, XIcon } from "lucide-react";

export default function PromoBanner() {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const code = "VIBECODE2025NOV";

  const recordClick = useCallback((source: number) => {
    const url = `https://api.llm7.io/record-click?source=${source}`;
    try {
      fetch(url, { method: "GET", keepalive: true, mode: "no-cors" }).catch(() => {});
    } catch (_err) {
      // Swallow errors to avoid impacting UX
    }
  }, []);

  useEffect(() => {
    const target = document.getElementById("plans");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        setCopied(false);
      });
    recordClick(1);
  }, [code, recordClick]);

  if (!revealed || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 flex justify-center">
      <div className="w-full max-w-4xl rounded-2xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-primary/10 backdrop-blur-md shadow-2xl">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center px-4 sm:px-6 py-4 pr-16">
          <button
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setDismissed(true);
              recordClick(3);
            }}
            aria-label="Close promotion"
          >
            <XIcon className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 flex-1">
            <div className="p-3 rounded-xl border border-border/50 bg-background/70 shadow-sm">
              <GiftIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold">50% off your first month</div>
              <p className="text-sm text-muted-foreground">
                Use the promo code below for any subscription until the end of Nov 2025.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 font-mono text-xs">
                {code}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleCopy}
                  aria-label="Copy promo code"
                >
                  {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-start mr-8">
            <Button
              asChild
              onClick={() => recordClick(2)}
            >
              <a href="https://dash.llm7.io/" target="_blank" rel="noreferrer">
                Subscribe
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
