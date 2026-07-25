"use client";

import { useState } from "react";

export default function CopyModelId({ modelId }: { modelId: string }) {
  const [copied, setCopied] = useState(false);
  return <button type="button" className="rounded border px-2 py-1 text-xs" onClick={async () => { await navigator.clipboard?.writeText(modelId); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }}>{copied ? "Copied" : "Copy model ID"}</button>;
}
