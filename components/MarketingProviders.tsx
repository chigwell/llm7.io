"use client";

import { Suspense } from "react";
import { PackageManagerProvider } from "@/contexts/PackageManagerContext";
import ReferralAttributionConsent from "@/components/ReferralAttributionConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ThemeProvider from "@/providers/ThemeProvider";

export default function MarketingProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider><PackageManagerProvider><Suspense fallback={null}><GoogleAnalytics /></Suspense><ReferralAttributionConsent />{children}</PackageManagerProvider></ThemeProvider>;
}
