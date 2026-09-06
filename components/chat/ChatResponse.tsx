"use client";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassPanel, motionSafe } from "./styles";
import { TypingText } from "./TypingText";

type Props = { status: "submitted" | "streaming" | "ready" | "error"; elapsedTime: number; error: string | null; response: string };
export function ChatResponse({ status, elapsedTime, error, response }: Props) {
  return (
        <div className="relative group flex items-center justify-center py-6 sm:py-10" style={{ paddingTop: "0px" }}>
          <div className={cn(
            "relative z-10 w-full",
            "max-w-[min(100%,48rem)]", // Same max-width as input
            motionSafe,
            "mt-4"
          )}
            >
            <div className={cn(
              "w-full overflow-hidden rounded-2xl",
              glassPanel,
              motionSafe,
              "hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
              "scrollbar-none overflow-x-hidden overflow-y-auto",
              "[&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0",
              "[-ms-overflow-style:none] [scrollbar-width:none]",
              "[&_*]:scrollbar-none [&_*::-webkit-scrollbar]:hidden",
              "[&_*]:[-ms-overflow-style:none] [&_*]:[scrollbar-width:none]",
              "p-6"
            )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Response</h3>
                {status === "submitted" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    <span>Generating... ({elapsedTime.toFixed(1)}s)</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                  <p>
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}

              {response && !error && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <TypingText
                    text={response}
                    speed={30}
                    showCursor={status === "submitted"}
                    cursorChar="|"
                    cursorClassName="text-primary"
                    className="text-sm leading-relaxed"
                  />
                </div>
              )}

              {!response && !error && status === "submitted" && (
                <div className="flex items-center justify-center py-8">
                  <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>
  );
}
