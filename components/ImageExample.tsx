"use client";

import {
  Loader2Icon,
  WandSparklesIcon,
  SquareIcon,
  XIcon,
  ImageIcon,
  DownloadIcon,
} from "lucide-react";
import type {
  ComponentProps,
  HTMLAttributes,
  KeyboardEventHandler,
} from "react";
import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/buttonShadcn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type FormEventHandler } from "react";
import { motion, TargetAndTransition } from "framer-motion";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Reusing styles from the original component
const glassPanel =
  "bg-background/70 dark:bg-background/60 backdrop-blur-xl backdrop-saturate-150 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)]";
const glassHover =
  "hover:bg-background/75 dark:hover:bg-background/65 hover:backdrop-blur-2xl";
const motionSafe =
  "motion-safe:transition-all motion-safe:duration-300 motion-reduce:transition-none";
const subtleFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0";

// Reusing components from the original code
export type AIInputProps = HTMLAttributes<HTMLFormElement>;
export const AIInput = ({ className, ...props }: AIInputProps) => (
  <form
    className={cn(
      "w-full overflow-hidden rounded-2xl",
      glassPanel,
      motionSafe,
      "hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
      "scrollbar-none overflow-x-hidden overflow-y-hidden",
      "[&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0",
      "[-ms-overflow-style:none] [scrollbar-width:none]",
      "[&_*]:scrollbar-none [&_*::-webkit-scrollbar]:hidden",
      "[&_*]:[-ms-overflow-style:none] [&_*]:[scrollbar-width:none]",
      className
    )}
    {...props}
  />
);

export type AIInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
};

const useAutoResizeTextarea = ({
  minHeight,
  maxHeight,
}: {
  minHeight: number;
  maxHeight?: number;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const el = textareaRef.current;
      if (!el) return;

      // Reset for accurate measurement
      el.style.height = reset ? `${minHeight}px` : `${minHeight}px`;

      const next = Math.max(
        minHeight,
        Math.min(el.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );
      el.style.height = `${next}px`;
    },
    [minHeight, maxHeight]
  );

  // Initial height
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  // On resize/orientation change
  useEffect(() => {
    const resize = () => adjustHeight();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
};

export const AIInputTextarea = ({
  onChange,
  className,
  placeholder = "Describe the image you want to generate...",
  minHeight = 88,
  maxHeight = 180,
  ...props
}: AIInputTextareaProps) => {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    // Respect IME composition to avoid premature submit on mobile
    // @ts-expect-error - composition API exists on event target at runtime
    if (e.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <Textarea
      className={cn(
        "w-full resize-none rounded-none border-none p-3 sm:p-4 shadow-none",
        "text-base leading-relaxed sm:text-[1rem] font-medium",
        "bg-transparent dark:bg-transparent",
        "placeholder:text-muted-foreground/60",
        "focus-visible:ring-0",
        motionSafe,
        // Remove scrollbars
        "scrollbar-none overflow-hidden overflow-x-hidden overflow-y-hidden",
        "[&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0",
        "[-ms-overflow-style:none] [scrollbar-width:none]",
        // Better mobile tap
        "touch-manipulation",
        className
      )}
      inputMode="text"
      autoCorrect="on"
      spellCheck
      aria-label="Image prompt"
      name="prompt"
      placeholder={placeholder}
      ref={textareaRef}
      onChange={(e) => {
        adjustHeight();
        onChange?.(e);
      }}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
};

export type AIInputToolbarProps = HTMLAttributes<HTMLDivElement>;
export const AIInputToolbar = ({
  className,
  ...props
}: AIInputToolbarProps) => (
  <div
    className={cn(
      "flex items-center justify-between px-2.5 py-2 sm:px-3 sm:py-2",
      "bg-gradient-to-r from-background/40 via-background/60 to-background/40",
      "backdrop-blur-md",
      motionSafe,
      className
    )}
    {...props}
  />
);

export type AIInputToolsProps = HTMLAttributes<HTMLDivElement>;
export const AIInputTools = ({ className, ...props }: AIInputToolsProps) => (
  <div
    className={cn(
      "flex items-center gap-1.5 sm:gap-2",
      "overflow-x-auto overflow-y-hidden no-scrollbar",
      "max-w-[calc(100vw-6rem)] sm:max-w-none",
      "pl-1 -ml-1 pr-2",
      className
    )}
    {...props}
  />
);

type ColorScheme = "purple" | "orange" | "blue" | "green" | "red";

const colorMap: Record<
  ColorScheme,
  { hover: string; active: string; text: string }
> = {
  purple: {
    hover:
      "hover:bg-purple-50/60 dark:hover:bg-purple-950/40 hover:border-purple-300/40",
    active:
      "bg-gradient-to-r from-purple-100/70 via-purple-200/50 to-purple-100/70 dark:from-purple-950/50 dark:via-purple-900/70 dark:to-purple-950/50 border-purple-300/60 dark:border-purple-700/60",
    text: "text-purple-700 dark:text-purple-300",
  },
  orange: {
    hover:
      "hover:bg-orange-50/60 dark:hover:bg-orange-950/40 hover:border-orange-300/40",
    active:
      "bg-gradient-to-r from-orange-100/70 via-orange-200/50 to-orange-100/70 dark:from-orange-950/50 dark:via-orange-900/70 dark:to-orange-950/50 border-orange-300/60 dark:border-orange-700/60",
    text: "text-orange-700 dark:text-orange-300",
  },
  blue: {
    hover:
      "hover:bg-blue-50/60 dark:hover:bg-blue-950/40 hover:border-blue-300/40",
    active:
      "bg-gradient-to-r from-blue-100/70 via-blue-200/50 to-blue-100/70 dark:from-blue-950/50 dark:via-blue-900/70 dark:to-blue-950/50 border-blue-300/60 dark:border-blue-700/60",
    text: "text-blue-700 dark:text-blue-300",
  },
  green: {
    hover:
      "hover:bg-green-50/60 dark:hover:bg-green-950/40 hover:border-green-300/40",
    active:
      "bg-gradient-to-r from-green-100/70 via-green-200/50 to-green-100/70 dark:from-green-950/50 dark:via-green-900/70 dark:to-green-950/50 border-green-300/60 dark:border-green-700/60",
    text: "text-green-700 dark:text-green-300",
  },
  red: {
    hover:
      "hover:bg-red-50/60 dark:hover:bg-red-950/40 hover:border-red-300/40",
    active:
      "bg-gradient-to-r from-red-100/70 via-red-200/50 to-red-100/70 dark:from-red-950/50 dark:via-red-900/70 dark:to-red-950/50 border-red-300/60 dark:border-red-700/60",
    text: "text-red-700 dark:text-red-300",
  },
};

export type AIInputButtonProps = ComponentProps<typeof Button> & {
  colorScheme?: ColorScheme;
};

export const AIInputButton = ({
  variant = "ghost",
  className,
  size,
  colorScheme = "blue",
  ...props
}: AIInputButtonProps) => {
  const newSize =
    size ?? (Children.count(props.children) > 1 ? "default" : "icon");

  return (
    <Button
      className={cn(
        "shrink-0 rounded-xl border border-transparent",
        "text-muted-foreground",
        motionSafe,
        "active:scale-95",
        "backdrop-blur-sm",
        colorMap[colorScheme].hover,
        newSize === "default" ? "px-3 py-2" : "h-10 w-10 sm:h-10 sm:w-10",
        subtleFocus,
        className
      )}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  );
};

export type AIInputSubmitProps = ComponentProps<typeof Button> & {
  status?: "submitted" | "streaming" | "ready" | "error";
};

export const AIInputSubmit = ({
  className,
  variant = "default",
  size = "icon",
  status,
  children,
  ...props
}: AIInputSubmitProps) => {
  let Icon = (
    <WandSparklesIcon className="motion-safe:transition-transform motion-safe:duration-300 group-hover/submit:translate-x-0.5" />
  );
  if (status === "submitted") Icon = <Loader2Icon className="animate-spin" />;
  else if (status === "streaming")
    Icon = <SquareIcon className="animate-pulse" />;
  else if (status === "error") Icon = <XIcon className="animate-bounce" />;

  const isDisabled = status === "submitted" || status === "streaming";

  return (
    <Button
      aria-label="Generate image"
      className={cn(
        "rounded-xl rounded-br-2xl border border-transparent",
        "bg-gradient-to-r from-primary via-primary/90 to-primary",
        "text-primary-foreground",
        "shadow-md hover:shadow-lg",
        "group/submit",
        motionSafe,
        "active:scale-95",
        size === "icon" ? "h-11 w-11 sm:h-11 sm:w-11" : "",
        subtleFocus,
        status === "error" &&
          "bg-gradient-to-r from-destructive via-destructive to-destructive",
        className
      )}
      disabled={isDisabled}
      size={size}
      type="submit"
      variant={variant}
      {...props}
    >
      {children ?? Icon}
    </Button>
  );
};

export type AIInputModelSelectProps = ComponentProps<typeof Select>;
export const AIInputModelSelect = (props: AIInputModelSelectProps) => (
  <Select {...props} />
);

export type AIInputModelSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>;
export const AIInputModelSelectTrigger = ({
  className,
  ...props
}: AIInputModelSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      "border border-transparent bg-transparent font-semibold text-muted-foreground",
      "rounded-xl",
      motionSafe,
      glassHover,
      "hover:scale-[1.015]",
      "active:scale-95",
      "backdrop-blur-sm",
      subtleFocus,
      "min-w-[120px] sm:min-w-[140px] px-2.5 py-2",
      className
    )}
    {...props}
  />
);

export type AIInputModelSelectContentProps = ComponentProps<
  typeof SelectContent
>;
export const AIInputModelSelectContent = ({
  className,
  ...props
}: AIInputModelSelectContentProps) => (
  <SelectContent
    className={cn(
      "rounded-xl",
      glassPanel,
      "max-h-[260px] sm:max-h-[300px]",
      "overflow-hidden overflow-y-auto",
      "no-scrollbar",
      motionSafe,
      className
    )}
    {...props}
  />
);

export type AIInputModelSelectItemProps = ComponentProps<typeof SelectItem>;
export const AIInputModelSelectItem = ({
  className,
  ...props
}: AIInputModelSelectItemProps) => (
  <SelectItem
    className={cn(
      "rounded-lg mx-1 my-0.5",
      "hover:bg-accent/70 focus:bg-accent/70",
      motionSafe,
      "cursor-pointer",
      className
    )}
    {...props}
  />
);

export type AIInputModelSelectValueProps = ComponentProps<typeof SelectValue>;
export const AIInputModelSelectValue = ({
  className,
  ...props
}: AIInputModelSelectValueProps) => (
  <SelectValue className={cn("font-semibold", className)} {...props} />
);

// Image size options
const imageSizes = [
  { id: "1024x1024", name: "Square (1024×1024)" },
  { id: "1024x768", name: "Landscape (1024×768)" },
  { id: "768x1024", name: "Portrait (768×1024)" },
];

export default function ImageGenerationInput() {
  const [prompt, setPrompt] = useState<string>("");
  const [model, setModel] = useState<string>("flux");
  const [imageSize, setImageSize] = useState<string>("1024x1024");
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  const [isFocused, setIsFocused] = useState(false);
  const [seed, setSeed] = useState<number | null>(null);
  const [nologo, setNologo] = useState<boolean>(false);

  // States for image generation
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showImage, setShowImage] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer functions
  const startTimer = () => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setElapsedTime(0);
  };

  async function fetchWithTimeout(
      input: RequestInfo | URL,
      init: RequestInit = {},
      timeoutMs = 180_000
    ): Promise<Response> {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(input, { ...init, signal: controller.signal });
        return res;
      } finally {
        clearTimeout(id);
      }
    }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
      e.preventDefault();
      if (!prompt.trim()) return;

      setStatus("submitted");
      setError(null);
      setImageUrl("");
      setShowImage(true);
      startTimer();

      try {
        const response = await fetchWithTimeout(
          "https://api.llm7.io/v1/images/generations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              prompt,
              size: imageSize,
              extra_body: {
                seed: seed || undefined,
                nologo,
              },
            }),
          },
          180_000 // 180 seconds
        );

        if (!response.ok) {
          throw new Error(
            `Failed to generate image: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const generatedImageUrl = data.data[0]?.url ?? "";

        setImageUrl(generatedImageUrl);
        setStatus("ready");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setError("Request timed out after 180s.");
        } else {
          console.error("Error generating image:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
        setStatus("error");
      } finally {
        stopTimer();
      }
    };

  const handleDownloadImage = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.target = '_blank';
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <motion.h3
              id="featured-heading"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3"
            >
              <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Image Generation
              </span>
            </motion.h3>
        </div>
      </div>
      <div className="relative group flex items-center justify-center py-6 sm:py-10">

        {/* Soft ambient gradient glow (mobile-friendly) */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 pointer-events-none",
            "opacity-60 sm:opacity-80"
          )}
        >
          <div className="absolute inset-0 m-auto max-w-5xl h-[40%] sm:h-[50%] blur-2xl sm:blur-3xl rounded-[48px] bg-gradient-to-r from-primary/15 via-purple-500/15 to-primary/15" />
        </div>

        <AIInput
          onSubmit={handleSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "relative z-10 w-full",
            "max-w-[min(100%,48rem)]", // 768px max
            motionSafe,
            isFocused && "ring-1 ring-primary/30"
          )}
        >
          <AIInputTextarea
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            className={cn(
              motionSafe,
              isFocused && "placeholder:text-muted-foreground/40",
              prompt.length > 0 && "font-semibold"
            )}
            placeholder="Describe the image you want to generate... ✨"
          />

          <AIInputToolbar
            className={cn(
              "items-stretch gap-2",
              "bg-gradient-to-r from-background/50 via-background/65 to-background/50",
              prompt.length > 0 && "backdrop-blur-xl"
            )}
          >
            <AIInputTools>
              <AIInputModelSelect onValueChange={setModel} value={model}>
                <AIInputModelSelectTrigger className="min-w-[116px] sm:min-w-[140px]">
                  <AIInputModelSelectValue placeholder="Model" />
                </AIInputModelSelectTrigger>
                <AIInputModelSelectContent>
                  <AIInputModelSelectItem value="flux">Flux 1.1 Pro</AIInputModelSelectItem>
                  <AIInputModelSelectItem value="turbo">lykon/dreamshaper-8-lcm</AIInputModelSelectItem>
                </AIInputModelSelectContent>
              </AIInputModelSelect>

              <AIInputModelSelect onValueChange={setImageSize} value={imageSize}>
                <AIInputModelSelectTrigger className="min-w-[116px] sm:min-w-[140px]">
                  <AIInputModelSelectValue placeholder="Size" />
                </AIInputModelSelectTrigger>
                <AIInputModelSelectContent>
                  {imageSizes.map((size) => (
                    <AIInputModelSelectItem key={size.id} value={size.id}>
                      {size.name}
                    </AIInputModelSelectItem>
                  ))}
                </AIInputModelSelectContent>
              </AIInputModelSelect>
            </AIInputTools>

            <AIInputSubmit
              status={status}
              className={cn(
                "relative overflow-hidden z-10",
                prompt.length > 0 && "shadow-lg",
                status === "ready" && prompt.length > 0 && "animate-none"
              )}
            />
          </AIInputToolbar>
        </AIInput>
      </div>

      {/* Image Display - Same width as input */}
        {showImage && (
          <div className="relative group flex items-center justify-center" style={{ paddingTop: "0", marginTop: "-24px" }}>
            <div className={cn(
              "relative z-10 w-full",
              "max-w-[min(100%,48rem)]", // Same max-width as input
              motionSafe
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
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Generated Image
                  </h3>
                  {status === "submitted" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      <span>Generating... ({elapsedTime.toFixed(1)}s)</span>
                    </div>
                  )}
                  {imageUrl && status === "ready" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadImage}
                      className="flex items-center gap-2"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                    <p>
                      <strong>Error:</strong> {error}
                    </p>
                  </div>
                )}

                {/* Loading Skeleton */}
                {status === "submitted" && !error && (
                  <div className="flex justify-center">
                    <SkeletonTheme baseColor="#7072f2f7" highlightColor="#9092f4f7">
                      <div className="w-full max-w-md">
                        <Skeleton height={400} className="rounded-lg" />
                      </div>
                    </SkeletonTheme>
                  </div>
                )}

                {/* Generated Image */}
                {imageUrl && !error && (
                  <div className="flex justify-center">
                    <img
                      src={imageUrl}
                      alt="Generated image"
                      className="max-w-full h-auto rounded-lg shadow-md"
                      style={{ maxHeight: "600px" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  );
}