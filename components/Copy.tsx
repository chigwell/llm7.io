"use client";

import { Check, Clipboard } from "lucide-react";
import { Button } from "./ui/buttonShadcn";
import { useState } from "react";

export default function Copy({ content }: { content: string }) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 w-8 p-0 hover:bg-primary/10 transition-all duration-200 group flex items-center justify-center"
      aria-label={isCopied ? "Copied!" : "Copy to clipboard"}
    >
      {isCopied ? (
        <Check className="w-3.5 h-3.5 text-green-600 animate-in zoom-in-50 duration-200" />
      ) : (
        <Clipboard className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
      )}
    </Button>
  );
}
