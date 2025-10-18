// components/GsiScriptLoader.tsx
"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function GsiScriptLoader() {
  useEffect(() => {
    // debug guard for HMR etc.
    if ((window as any).__gsi_script_registered) return;
    (window as any).__gsi_script_registered = true;
  }, []);

  return (
    <Script
      id="gsi-client"
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        console.log("GSI script loaded (next/script)");
      }}
    />
  );
}
