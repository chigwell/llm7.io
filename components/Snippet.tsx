"use client";

import { Card } from "@/components/ui/card";
import Copy from "@/components/Copy";

interface SnippetProps {
  text: string;
  width?: string;
  variant?: "default" | "success" | "warning" | "info";
  showIndicator?: boolean;
}

export function Snippet({
  text,
  width,
  variant = "default",
  showIndicator = true,
}: SnippetProps) {
  const variantStyles = {
    default: "bg-muted/50 hover:bg-muted/70 border-dashed",
    success:
      "bg-green-50/50 hover:bg-green-50/70 border-green-200/50 dark:bg-green-950/20 dark:hover:bg-green-950/30 dark:border-green-800/50",
    warning:
      "bg-yellow-50/50 hover:bg-yellow-50/70 border-yellow-200/50 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30 dark:border-yellow-800/50",
    info: "bg-blue-50/50 hover:bg-blue-50/70 border-blue-200/50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 dark:border-blue-800/50",
  };

  const indicatorColors = {
    default: "bg-green-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <Card
      className={`relative flex flex-nowrap p-3 w-full transition-all duration-200 group ${
        variantStyles[variant]
      } ${
        width
          ? "max-w-none"
          : "max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[740px]"
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {showIndicator && (
          <div
            className={`w-2 h-2 rounded-full ${indicatorColors[variant]} opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0`}
          ></div>
        )}
        <div className="flex items-center flex-1 min-w-0">
          <code className="text-sm font-mono text-foreground/90 flex-1 select-all whitespace-nowrap overflow-hidden">
            {text}
          </code>
          <div className="flex-shrink-0 ml-3">
            <Copy content={text} />
          </div>
        </div>
      </div>
    </Card>
  );
}
