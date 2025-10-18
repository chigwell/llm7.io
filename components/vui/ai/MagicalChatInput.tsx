
"use client";

import {
  Loader2Icon,
  SendIcon,
  SquareIcon,
  XIcon,
  GlobeIcon,
  MicIcon,
  PlusIcon,
  FlaskConicalIcon,
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

type UseAutoResizeTextareaProps = {
  minHeight: number;
  maxHeight?: number;
};

const useAutoResizeTextarea = ({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) => {
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

const glassPanel =
  "bg-background/70 dark:bg-background/60 backdrop-blur-xl backdrop-saturate-150 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)]";
const glassHover =
  "hover:bg-background/75 dark:hover:bg-background/65 hover:backdrop-blur-2xl";
const motionSafe =
  "motion-safe:transition-all motion-safe:duration-300 motion-reduce:transition-none";
const subtleFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0";

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

export const AIInputTextarea = ({
  onChange,
  className,
  placeholder = "What would you like to cook?",
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
      aria-label="Message"
      name="message"
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

export type AIInputToggleButtonProps = ComponentProps<typeof Button> & {
  isActive?: boolean;
  colorScheme?: ColorScheme;
};

export const AIInputToggleButton = ({
  variant = "ghost",
  className,
  size,
  isActive = false,
  colorScheme = "purple",
  ...props
}: AIInputToggleButtonProps) => {
  const newSize =
    size ?? (Children.count(props.children) > 1 ? "default" : "icon");

  return (
    <Button
      aria-pressed={isActive}
      className={cn(
        "shrink-0 rounded-xl border",
        "backdrop-blur-sm",
        motionSafe,
        "active:scale-95",
        newSize === "default" ? "px-3 py-2" : "h-10 w-10 sm:h-10 sm:w-10",
        isActive
          ? cn(
              colorMap[colorScheme].active,
              colorMap[colorScheme].text,
              "shadow-md"
            )
          : cn(
              "border-transparent text-muted-foreground",
              colorMap[colorScheme].hover
            ),
        subtleFocus,
        className
      )}
      size={newSize}
      type="button"
      variant={isActive ? "outline" : variant}
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
    <SendIcon className="motion-safe:transition-transform motion-safe:duration-300 group-hover/submit:translate-x-0.5" />
  );
  if (status === "submitted") Icon = <Loader2Icon className="animate-spin" />;
  else if (status === "streaming")
    Icon = <SquareIcon className="animate-pulse" />;
  else if (status === "error") Icon = <XIcon className="animate-bounce" />;

  const isDisabled = status === "submitted" || status === "streaming";

  return (
    <Button
      aria-label="Send message"
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


const models = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "claude-2", name: "Claude 2" },
  { id: "claude-instant", name: "Claude Instant" },
  { id: "palm-2", name: "PaLM 2" },
  { id: "llama-2-70b", name: "Llama 2 70B" },
  { id: "llama-2-13b", name: "Llama 2 13B" },
  { id: "cohere-command", name: "Command" },
  { id: "mistral-7b", name: "Mistral 7B" },
];

export default function MagicalChatInput() {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>(models[0].id);
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  const [isFocused, setIsFocused] = useState(false);
  const [isDeepResearchEnabled, setIsDeepResearchEnabled] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    alert(`You entered: ${text}`);
    setStatus("submitted");
    setTimeout(() => setStatus("streaming"), 200);
    setTimeout(() => setStatus("ready"), 1800);
  };

  const showFooterPill = text.length > 0;
  const pillContent = useMemo(() => {
    if (isWebSearchEnabled || isDeepResearchEnabled) {
      return (
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            <span className="font-medium">Press Enter to send</span>
          </div>
          {isWebSearchEnabled && (
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <GlobeIcon
                size={16}
                className="animate-spin"
                style={{ animationDuration: "3s" }}
                aria-hidden
              />
              <span className="font-semibold">Web search active</span>
            </div>
          )}
          {isDeepResearchEnabled && (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <FlaskConicalIcon
                size={16}
                className="animate-bounce"
                aria-hidden
              />
              <span className="font-semibold">Research mode</span>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
        <span className="font-medium">Press Enter to send</span>
      </div>
    );
  }, [isWebSearchEnabled, isDeepResearchEnabled]);

  return (
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
          onChange={(e) => setText(e.target.value)}
          value={text}
          className={cn(
            motionSafe,
            isFocused && "placeholder:text-muted-foreground/40",
            text.length > 0 && "font-semibold"
          )}
          placeholder="Ask me anything... ✨"
        />

        <AIInputToolbar
          className={cn(
            "items-stretch gap-2",
            "bg-gradient-to-r from-background/50 via-background/65 to-background/50",
            text.length > 0 && "backdrop-blur-xl"
          )}
        >
          <AIInputTools>
            <AIInputButton colorScheme="blue" aria-label="Add attachment">
              <PlusIcon size={18} />
            </AIInputButton>

            <AIInputButton colorScheme="green" aria-label="Record voice">
              <MicIcon size={18} />
            </AIInputButton>

            <AIInputToggleButton
              isActive={isWebSearchEnabled}
              onClick={() => setIsWebSearchEnabled((v) => !v)}
              colorScheme="purple"
              aria-label="Toggle web search"
            >
              <GlobeIcon size={18} />
              <span className="hidden sm:inline font-semibold">Web Search</span>
            </AIInputToggleButton>

            <AIInputToggleButton
              isActive={isDeepResearchEnabled}
              onClick={() => setIsDeepResearchEnabled((v) => !v)}
              colorScheme="orange"
              aria-label="Toggle research mode"
            >
              <FlaskConicalIcon size={18} />
              <span className="hidden sm:inline font-semibold">Research</span>
            </AIInputToggleButton>

            <AIInputModelSelect onValueChange={setModel} value={model}>
              <AIInputModelSelectTrigger className="min-w-[116px] sm:min-w-[140px]">
                <AIInputModelSelectValue />
              </AIInputModelSelectTrigger>
              <AIInputModelSelectContent>
                {models.map((m) => (
                  <AIInputModelSelectItem key={m.id} value={m.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{m.name}</span>
                      {m.id === "gpt-4" && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-3 font-semibold">
                          Popular
                        </span>
                      )}
                    </div>
                  </AIInputModelSelectItem>
                ))}
              </AIInputModelSelectContent>
            </AIInputModelSelect>
          </AIInputTools>

          <AIInputSubmit
            status={status}
            className={cn(
              "relative overflow-hidden z-10",
              text.length > 0 && "shadow-lg",
              status === "ready" && text.length > 0 && "animate-none"
            )}
          />
        </AIInputToolbar>
      </AIInput>

      {/* Footer hint pill */}
      {showFooterPill && (
        <div className="absolute -bottom-12 sm:-bottom-14 left-0 right-0 flex justify-center px-3">
          <div
            className={cn(
              "px-4 py-2 sm:px-6 sm:py-3 rounded-full",
              glassPanel,
              "text-[0.8rem]",
              "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
            )}
          >
            {pillContent}
          </div>
        </div>
      )}

      {/* Subtle success pulse */}
      {status === "submitted" && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl border-2 border-primary/40 animate-ping"
          />
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl bg-primary/5 animate-pulse"
          />
        </>
      )}
    </div>
  );
}
