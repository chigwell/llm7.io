"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  borderWidth?: number;
  className?: string;
  llm_system_instructions?: string;
}

export function StarButton({
  children,
  borderWidth = 2,
  className,
  ...props
}: StarButtonProps) {
  return (
    <button
      className={cn(
        "relative z-[3] isolate overflow-hidden h-9 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 group/star-button bg-black text-white dark:bg-white dark:text-black",
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 dark:border-white/15 border-black/10 z-[4] overflow-hidden rounded-[inherit] text-black dark:text-white"
        style={{ borderWidth }}
        aria-hidden="true"
      />
      <span className="z-10 relative inline-block text-white dark:text-black">
        {children}
      </span>
    </button>
  );
}
