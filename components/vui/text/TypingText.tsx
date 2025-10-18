"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface CursorAnimationVariants extends Variants {
  initial: Variants["initial"];
  animate: Variants["animate"];
}
interface TypingTextProps {
  text: string | string[];
  speed?: number;
  initialDelay?: number;
  waitTime?: number;
  deleteSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorOnType?: boolean;
  cursorChar?: string | React.ReactNode;
  cursorAnimationVariants?: CursorAnimationVariants;
  cursorClassName?: string;
  onTypingStart?: () => void;
  onTypingComplete?: () => void;
  onDeletingStart?: () => void;
  onDeletingComplete?: () => void;
}

/**
 * Default cursor animation variants
 */
const DEFAULT_CURSOR_VARIANTS: CursorAnimationVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.01,
      repeat: Infinity,
      repeatDelay: 0.4,
      repeatType: "reverse",
    },
  },
};

const TypingText = ({
  text,
  speed = 50,
  initialDelay = 0,
  waitTime = 2000,
  deleteSpeed = 30,
  loop = true,
  className,
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "|",
  cursorClassName = "ml-1",
  cursorAnimationVariants = DEFAULT_CURSOR_VARIANTS,
  onTypingStart,
  onTypingComplete,
  onDeletingStart,
  onDeletingComplete,
}: TypingTextProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoize texts array to prevent unnecessary re-renders
  const texts = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentIndex = 0;
    let isDeleting = false;
    let currentTextIndex = 0;
    let hasStarted = false;

    const animate = () => {
      const currentText = texts[currentTextIndex];

      // Handle initial delay
      if (!hasStarted) {
        hasStarted = true;
        onTypingStart?.();
        if (initialDelay > 0) {
          timeout = setTimeout(animate, initialDelay);
          return;
        }
      }

      if (isDeleting) {
        // Deleting phase
        setDisplayText(currentText.substring(0, currentIndex));
        currentIndex--;

        if (currentIndex < 0) {
          // Finished deleting
          isDeleting = false;
          onDeletingComplete?.();

          // Move to next text
          if (currentTextIndex === texts.length - 1 && !loop) {
            setIsAnimating(false);
            return;
          }

          currentTextIndex = (currentTextIndex + 1) % texts.length;
          onTypingStart?.();
          timeout = setTimeout(animate, waitTime);
        } else {
          timeout = setTimeout(animate, deleteSpeed);
        }
      } else {
        // Typing phase
        setDisplayText(currentText.substring(0, currentIndex + 1));
        currentIndex++;

        if (currentIndex === currentText.length) {
          // Finished typing current text
          onTypingComplete?.();

          if (texts.length > 1 && loop) {
            onDeletingStart?.();
            isDeleting = true;
            timeout = setTimeout(animate, waitTime);
          } else {
            setIsAnimating(false);
          }
        } else {
          timeout = setTimeout(animate, speed);
        }
      }
    };

    setIsAnimating(true);
    animate();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [
    text,
    speed,
    deleteSpeed,
    waitTime,
    initialDelay,
    loop,
    texts,
    onTypingStart,
    onTypingComplete,
    onDeletingStart,
    onDeletingComplete,
  ]);

  /**
   * Determine if cursor should be hidden
   */
  const shouldHideCursor = useMemo(
    () => hideCursorOnType && isAnimating,
    [hideCursorOnType, isAnimating]
  );

  return (
    <div className={cn("inline whitespace-pre-wrap tracking-tight", className)}>
      <span>{displayText}</span>
      {showCursor && (
        <motion.span
          variants={cursorAnimationVariants}
          className={cn(cursorClassName, shouldHideCursor && "hidden")}
          initial="initial"
          animate="animate"
        >
          {cursorChar}
        </motion.span>
      )}
    </div>
  );
};

export default TypingText;

export function TypingTextShowcase() {
  return (
    <div className="min-h-5 bg-gradient-to-br from-background via-muted/20 to-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          {/* Main Demo */}
          <div className="relative p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-2xl">
            <div className="text-center">
              <TypingText
                text={[
                  "Welcome to the future of UI! 🚀",
                  "Beautiful typing animations ✨",
                  "Smooth. Fast. Elegant. 💎",
                  "Built for modern web apps 🎯",
                ]}
                speed={60}
                deleteSpeed={40}
                waitTime={2000}
                loop
                showCursor
                className="text-2xl md:text-3xl font-semibold text-foreground"
                cursorClassName="text-primary font-bold"
              />
            </div>
          </div>
        </div>

        {/* Examples Grid */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Examples & Variations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Professional Use Case */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  Professional
                </h3>
                <p className="text-sm text-muted-foreground">
                  Perfect for landing pages and hero sections
                </p>
                <div className="h-16 flex items-center">
                  <TypingText
                    text={[
                      "Building the future...",
                      "One component at a time...",
                      "Innovation never stops...",
                    ]}
                    speed={80}
                    deleteSpeed={50}
                    waitTime={1800}
                    loop
                    className="text-blue-800 dark:text-blue-200 font-medium"
                    cursorChar="▋"
                    cursorClassName="text-blue-600 dark:text-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Fast & Energetic */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-green-50/50 to-emerald-100/30 dark:from-green-950/30 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/30 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                  Lightning Fast
                </h3>
                <p className="text-sm text-muted-foreground">
                  High-speed typing for dynamic content
                </p>
                <div className="h-16 flex items-center">
                  <TypingText
                    text={["⚡ Super fast typing effect! Ready in milliseconds!", "Ready in milliseconds!"]}
                    speed={25}
                    loop={true}
                    className="text-green-800 dark:text-green-200 font-semibold"
                    cursorChar="●"
                    cursorClassName="text-green-500 animate-pulse"
                  />
                </div>
              </div>
            </div>

            {/* Elegant & Slow */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-violet-100/30 dark:from-purple-950/30 dark:to-violet-900/20 border border-purple-200/50 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                  Elegant
                </h3>
                <p className="text-sm text-muted-foreground">
                  Smooth and thoughtful pacing
                </p>
                <div className="h-16 flex items-center">
                  <TypingText
                    text={["Elegance in every keystroke... ✨", "Elegance is the key to success"]}
                    speed={120}
                    loop={true}
                    initialDelay={500}
                    className="text-purple-800 dark:text-purple-200 font-medium italic"
                    cursorChar="│"
                    cursorClassName="text-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Code Style */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-slate-50/50 to-gray-100/30 dark:from-slate-950/30 dark:to-gray-900/20 border border-slate-200/50 dark:border-slate-800/30 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Code Terminal
                </h3>
                <p className="text-sm text-muted-foreground">
                  Developer-friendly monospace styling
                </p>
                <div className="h-16 flex items-center">
                  <TypingText
                    text={[
                      "$ npm install awesome-ui",
                      "$ yarn add beautiful-components",
                      "$ pnpm install modern-design",
                    ]}
                    speed={70}
                    deleteSpeed={35}
                    waitTime={2500}
                    loop
                    className="font-mono text-sm text-slate-800 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1 rounded"
                    cursorChar="_"
                    cursorClassName="text-slate-600 dark:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* No Cursor */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-orange-50/50 to-amber-100/30 dark:from-orange-950/30 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-800/30 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                  Clean & Minimal
                </h3>
                <p className="text-sm text-muted-foreground">
                  No cursor distraction
                </p>
                <div className="h-16 flex items-center">
                  <TypingText
                    text={["Pure text, no distractions", "Only the best for you"]}
                    speed={90}
                    showCursor={false}
                    loop={true}
                    className="text-orange-800 dark:text-orange-200 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Custom Styled */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-rose-50/50 to-pink-100/30 dark:from-rose-950/30 dark:to-pink-900/20 border border-rose-200/50 dark:border-rose-800/30 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-300">
                  Creative Cursor
                </h3>
                <p className="text-sm text-muted-foreground">
                  Custom cursor characters and styling
                </p>
                <div className="h-16 flex items-center">
                  <TypingText
                    text={["Creativity knows no bounds! 🎨", "Innovation never stops... 🚀"]}
                    speed={75}
                    loop={true}
                    cursorChar="✨"
                    cursorClassName="text-rose-500 text-lg"
                    className="text-rose-800 dark:text-rose-200 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TypingTextTheme() {
  return (
    <>
      <TypingText
        text={[
          "Welcome to the future of UI! 🚀",
          "Beautiful typing animations ✨",
          "Smooth. Fast. Elegant. 💎",
          "Built for modern web apps 🎯",
        ]}
        speed={60}
        deleteSpeed={40}
        waitTime={2000}
        loop={true}
        showCursor={true}
        className="text-2xl md:text-3xl font-semibold text-foreground"
        cursorChar="✨"
        cursorClassName="text-primary font-bold"
      />
    </>
  );
}
