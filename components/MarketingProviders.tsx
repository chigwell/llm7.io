"use client";

import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PackageManagerProvider } from "@/contexts/PackageManagerContext";
import ReferralAttributionConsent from "@/components/ReferralAttributionConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ThemeProvider from "@/providers/ThemeProvider";

export default function MarketingProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider><PackageManagerProvider><Suspense fallback={null}><GoogleAnalytics /></Suspense><ReferralAttributionConsent />{children}<Analytics /><SpeedInsights /></PackageManagerProvider></ThemeProvider>;
}
