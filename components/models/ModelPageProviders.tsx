"use client";

import { ThemeProvider } from "next-themes";

export default function ModelPageProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="vyoma-ui-theme">
      {children}
    </ThemeProvider>
  );
}
