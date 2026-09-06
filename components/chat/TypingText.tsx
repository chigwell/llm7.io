"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, type TargetAndTransition } from "framer-motion";
import { cn } from "@/lib/utils";
// TypingText component
// Fix: Update the type definition to match Framer Motion's Variants type
type CursorAnimationVariants = {
  [key: string]: TargetAndTransition;
};

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

interface TypingTextProps {
  text: string;
  speed?: number;
  initialDelay?: number;
  className?: string;
  showCursor?: boolean;
  hideCursorOnType?: boolean;
  cursorChar?: string | React.ReactNode;
  cursorAnimationVariants?: CursorAnimationVariants;
  cursorClassName?: string;
  onComplete?: () => void;
}

export const TypingText = ({
  text,
  speed = 30,
  initialDelay = 0,
  className,
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "|",
  cursorClassName = "ml-1",
  cursorAnimationVariants = DEFAULT_CURSOR_VARIANTS,
  onComplete,
}: TypingTextProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentIndex = 0;
    let hasStarted = false;

    const animate = () => {
      // Handle initial delay
      if (!hasStarted) {
        hasStarted = true;
        if (initialDelay > 0) {
          timeout = setTimeout(animate, initialDelay);
          return;
        }
      }

      if (currentIndex < text.length) {
        // Typing phase
        setDisplayText(text.substring(0, currentIndex + 1));
        currentIndex++;
        timeout = setTimeout(animate, speed);
      } else {
        // Finished typing
        setIsAnimating(false);
        onComplete?.();
      }
    };

    setIsAnimating(true);
    animate();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [text, speed, initialDelay, onComplete]);

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

