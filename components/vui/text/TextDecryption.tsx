"use client";

import { useEffect, useState, useRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { useTheme } from "next-themes";

interface TextDecryptionProps extends HTMLMotionProps<"span"> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: "view" | "hover";
  glowEffect?: boolean;
  typewriterEffect?: boolean;
  loop?: boolean;
  loopDelay?: number;
}

function TextDecryption({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  glowEffect = false,
  typewriterEffect = false,
  loop = false,
  loopDelay = 2000,
  ...props
}: TextDecryptionProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isScrambling, setIsScrambling] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(
    new Set()
  );
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();

  // Theme-aware default styling classes
  const getThemeAwareClasses = () => {
    if (className) return className;

    return theme === "dark"
      ? "text-green-400 font-mono transition-all duration-300"
      : "text-green-600 font-mono transition-all duration-300";
  };

  const getThemeAwareEncryptedClasses = () => {
    if (encryptedClassName) return encryptedClassName;

    return theme === "dark"
      ? "text-gray-500 font-mono opacity-70 transition-all duration-150"
      : "text-gray-400 font-mono opacity-60 transition-all duration-150";
  };

  const getThemeAwareParentClasses = () => {
    if (parentClassName) return parentClassName;

    return "inline-block cursor-pointer transition-all duration-300";
  };

  const defaultClassName = getThemeAwareClasses();
  const defaultEncryptedClassName = getThemeAwareEncryptedClasses();
  const defaultParentClassName = getThemeAwareParentClasses();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let currentIteration = 0;

    const getNextIndex = (revealedSet: Set<number>): number => {
      const textLength = text.length;
      switch (revealDirection) {
        case "start":
          return revealedSet.size;
        case "end":
          return textLength - 1 - revealedSet.size;
        case "center": {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const nextIndex =
            revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

          if (
            nextIndex >= 0 &&
            nextIndex < textLength &&
            !revealedSet.has(nextIndex)
          ) {
            return nextIndex;
          }
          for (let i = 0; i < textLength; i++) {
            if (!revealedSet.has(i)) return i;
          }
          return 0;
        }
        default:
          return revealedSet.size;
      }
    };

    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(""))).filter((char) => char !== " ")
      : characters.split("");

    // Helper function to check if a character is an emoji or special Unicode character
    const isEmojiOrSpecial = (char: string): boolean => {
      const emojiRegex =
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      return emojiRegex.test(char) || char.charCodeAt(0) > 127;
    };

    // Use Array.from for proper Unicode character handling
    const getTextChars = (text: string): string[] => {
      return Array.from(text);
    };

    const shuffleText = (
      originalText: string,
      currentRevealed: Set<number>
    ): string => {
      const textChars = getTextChars(originalText);

      if (useOriginalCharsOnly) {
        const positions = textChars.map((char, i) => ({
          char,
          isSpace: char === " ",
          isEmoji: isEmojiOrSpecial(char),
          index: i,
          isRevealed: currentRevealed.has(i),
        }));

        const nonSpecialChars = positions
          .filter((p) => !p.isSpace && !p.isEmoji && !p.isRevealed)
          .map((p) => p.char);

        for (let i = nonSpecialChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonSpecialChars[i], nonSpecialChars[j]] = [
            nonSpecialChars[j],
            nonSpecialChars[i],
          ];
        }

        let charIndex = 0;
        return positions
          .map((p) => {
            if (p.isSpace || p.isEmoji) return p.char; // Preserve spaces and emojis
            if (p.isRevealed) return textChars[p.index];
            return nonSpecialChars[charIndex++] || p.char;
          })
          .join("");
      } else {
        return textChars
          .map((char, i) => {
            if (char === " " || isEmojiOrSpecial(char)) return char; // Preserve spaces and emojis
            if (currentRevealed.has(i)) return textChars[i];
            return availableChars[
              Math.floor(Math.random() * availableChars.length)
            ];
          })
          .join("");
      }
    };

    if (isHovering) {
      setIsScrambling(true);
      interval = setInterval(() => {
        setRevealedIndices((prevRevealed) => {
          if (sequential) {
            if (prevRevealed.size < text.length) {
              const nextIndex = getNextIndex(prevRevealed);
              const newRevealed = new Set(prevRevealed);
              newRevealed.add(nextIndex);
              setDisplayText(shuffleText(text, newRevealed));
              return newRevealed;
            } else {
              clearInterval(interval);
              setIsScrambling(false);

              // Start loop if enabled and on view animation
              if (loop && animateOn === "view" && !isLooping) {
                setIsLooping(true);
                loopTimeoutRef.current = setTimeout(() => {
                  setRevealedIndices(new Set());
                  setIsHovering(false);
                  setIsLooping(false);
                  setTimeout(() => {
                    setIsHovering(true);
                  }, 100);
                }, loopDelay);
              }

              return prevRevealed;
            }
          } else {
            setDisplayText(shuffleText(text, prevRevealed));
            currentIteration++;
            if (currentIteration >= maxIterations) {
              clearInterval(interval);
              setIsScrambling(false);
              setDisplayText(text);

              // Start loop if enabled and on view animation
              if (loop && animateOn === "view" && !isLooping) {
                setIsLooping(true);
                loopTimeoutRef.current = setTimeout(() => {
                  setRevealedIndices(new Set());
                  setIsHovering(false);
                  setIsLooping(false);
                  setTimeout(() => {
                    setIsHovering(true);
                  }, 100);
                }, loopDelay);
              }
            }
            return prevRevealed;
          }
        });
      }, speed);
    } else {
      setDisplayText(text);
      setRevealedIndices(new Set());
      setIsScrambling(false);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, [
    isHovering,
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    characters,
    useOriginalCharsOnly,
    loop,
    loopDelay,
    animateOn,
    isLooping,
    theme,
  ]);

  useEffect(() => {
    if (animateOn !== "view") return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && (!hasAnimated || loop)) {
          setIsHovering(true);
          if (!loop) setHasAnimated(true);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [animateOn, hasAnimated, loop]);

  const hoverProps =
    animateOn === "hover"
      ? {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        }
      : {};

  const getThemeAwareGlow = () => {
    if (!glowEffect || !isHovering) return "";

    return theme === "dark"
      ? "drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
      : "drop-shadow-[0_0_8px_rgba(22,163,74,0.4)]";
  };

  const containerClasses = [
    defaultParentClassName,
    getThemeAwareGlow(),
    isScrambling ? "animate-pulse" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${containerClasses}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...hoverProps}
      {...props}
    >
      {/* Screen reader accessible text */}
      <span className="sr-only">{text}</span>

      {/* Visual text with scramble effect */}
      <span aria-hidden="true" className="relative">
        {Array.from(displayText).map((char, index) => {
          const isRevealedOrDone =
            revealedIndices.has(index) || !isScrambling || !isHovering;

          return (
            <motion.span
              key={`${index}-${char}`}
              className={`${
                isRevealedOrDone ? defaultClassName : defaultEncryptedClassName
              } relative inline-block`}
              initial={
                typewriterEffect ? { opacity: 0, scale: 0.8 } : undefined
              }
              animate={
                typewriterEffect && isRevealedOrDone
                  ? { opacity: 1, scale: 1 }
                  : typewriterEffect
                  ? { opacity: 0.7, scale: 0.9 }
                  : undefined
              }
              transition={{
                duration: 0.2,
                delay: typewriterEffect ? index * 0.05 : 0,
                ease: "easeOut",
              }}
            >
              {char}
              {/* Subtle glow effect for revealed characters */}
              {glowEffect && isRevealedOrDone && (
                <span className="absolute inset-0 text-green-400 opacity-50 blur-sm pointer-events-none">
                  {char}
                </span>
              )}
            </motion.span>
          );
        })}

        {/* Cursor effect for typewriter mode */}
        {typewriterEffect && isScrambling && (
          <motion.span
            className="inline-block w-0.5 h-5 bg-green-400 ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        )}
      </span>
    </motion.span>
  );
}

export default function TextDecryptionShowcase() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-16 bg-background text-foreground min-h-screen">
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="group p-8 border border-border rounded-xl bg-card hover:border-green-500 dark:hover:border-green-400 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-card-foreground">
                Hover to Decrypt
              </h3>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                HOVER
              </span>
            </div>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <TextDecryption
                text="Hover over me to see the magic!"
                animateOn="hover"
                className="text-green-600 dark:text-green-400 text-xl"
              />
            </div>
            <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
              {`<TextDecryption 
  text="Hover over me to see the magic!" 
  animateOn="hover" 
/>`}
            </div>
          </div>

          <div className="group p-8 border border-border rounded-xl bg-card hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-card-foreground">
                Auto Decrypt on View
              </h3>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                AUTO
              </span>
            </div>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <TextDecryption
                text="I decrypt when you see me"
                sequential={true}
                revealDirection="start"
                speed={120}
                animateOn="view"
                loop={true}
                loopDelay={1000}
                className="text-blue-600 dark:text-blue-400 text-xl"
              />
            </div>
            <div className="text-xs text-muted-foreground font-mono bg-muted p-3 rounded">
              {`<TextDecryption 
  text="I decrypt automatically when you see me" 
  animateOn="view"
  loop={true}
  loopDelay={3000}
/>`}
            </div>
          </div>
        </div>
      </section>

      {/* Sequential vs Random */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-primary mb-3">
            Sequential vs Random Decryption
          </h2>
          <p className="text-muted-foreground">
            Compare different animation styles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-medium text-card-foreground mb-3">
              Sequential (Left to Right)
            </h3>
            <TextDecryption
              text="Sequential decryption from start"
              sequential={true}
              revealDirection="start"
              animateOn="hover"
              className="text-purple-600 dark:text-purple-400 text-lg"
            />
          </div>

          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-medium text-card-foreground mb-3">
              Random Scramble
            </h3>
            <TextDecryption
              text="Random character scrambling"
              sequential={false}
              maxIterations={15}
              animateOn="hover"
              className="text-yellow-600 dark:text-yellow-400 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Reveal Directions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-green-300 border-b border-green-800 pb-2">
          Reveal Directions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-sm font-medium text-gray-200 mb-3">
              From Start
            </h3>
            <TextDecryption
              text="Start to End"
              sequential={true}
              revealDirection="start"
              animateOn="hover"
              className="text-green-400"
            />
          </div>

          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-sm font-medium text-gray-200 mb-3">From End</h3>
            <TextDecryption
              text="End to Start"
              sequential={true}
              revealDirection="end"
              animateOn="hover"
              className="text-red-400"
            />
          </div>

          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-sm font-medium text-gray-200 mb-3">
              From Center
            </h3>
            <TextDecryption
              text="Center Outward"
              sequential={true}
              revealDirection="center"
              animateOn="hover"
              className="text-cyan-400"
            />
          </div>
        </div>
      </section>

      {/* Speed Variations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-green-300 border-b border-green-800 pb-2">
          Speed Variations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-sm font-medium text-gray-200 mb-3">
              Slow (200ms)
            </h3>
            <TextDecryption
              text="Slow and steady"
              speed={200}
              sequential={true}
              animateOn="hover"
              className="text-orange-400"
            />
          </div>

          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-sm font-medium text-gray-200 mb-3">
              Normal (50ms)
            </h3>
            <TextDecryption
              text="Normal speed"
              speed={50}
              sequential={true}
              animateOn="hover"
              className="text-pink-400"
            />
          </div>

          <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-sm font-medium text-gray-200 mb-3">
              Fast (20ms)
            </h3>
            <TextDecryption
              text="Lightning fast"
              speed={20}
              sequential={true}
              animateOn="hover"
              className="text-indigo-400"
            />
          </div>
        </div>
      </section>

      {/* Character Sets */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-green-300 border-b border-green-800 pb-2">
          Custom Character Sets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-lg font-medium text-gray-200 mb-3">
              Numbers Only
            </h3>
            <TextDecryption
              text="1234567890"
              characters="0123456789"
              sequential={true}
              animateOn="hover"
              className="text-green-400 text-2xl font-mono"
            />
          </div>

          <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-lg font-medium text-gray-200 mb-3">
              Symbols Only
            </h3>
            <TextDecryption
              text="!@#$%^&*()"
              characters="!@#$%^&*()_+-=[]{}|;:,.<>?"
              sequential={true}
              animateOn="hover"
              className="text-red-400 text-2xl font-mono"
            />
          </div>
        </div>
      </section>

      {/* Original Characters Only */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-green-300 border-b border-green-800 pb-2">
          Original Characters Mode
        </h2>

        <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
          <h3 className="text-lg font-medium text-gray-200 mb-3">
            Scrambles only using characters from the original text
          </h3>
          <TextDecryption
            text="Hello World"
            useOriginalCharsOnly={true}
            sequential={false}
            maxIterations={20}
            animateOn="hover"
            className="text-cyan-400 text-2xl"
          />
        </div>
      </section>

      {/* Visual Effects */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-green-300 border-b border-green-800 pb-2">
          Visual Effects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-lg font-medium text-gray-200 mb-3">
              Glow Effect
            </h3>
            <TextDecryption
              text="Glowing text effect"
              glowEffect={true}
              sequential={true}
              animateOn="hover"
              className="text-green-400 text-xl font-bold"
            />
          </div>

          <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
            <h3 className="text-lg font-medium text-gray-200 mb-3">
              Typewriter Effect
            </h3>
            <TextDecryption
              text="Typewriter style reveal"
              typewriterEffect={true}
              sequential={true}
              animateOn="hover"
              className="text-blue-400 text-xl"
            />
          </div>
        </div>
      </section>

      {/* Real-World Use Cases */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-primary mb-3">
            Real-World Use Cases
          </h2>
          <p className="text-muted-foreground">
            See how TextDecryption works in practical scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loading State */}
          <div className="p-8 border border-border rounded-xl bg-card">
            <h3 className="text-xl font-medium text-card-foreground mb-4">
              Loading State
            </h3>
            <div className="space-y-3 mb-6">
              <TextDecryption
                text="Loading user profile..."
                sequential={true}
                speed={80}
                animateOn="view"
                loop={true}
                loopDelay={2500}
                className="text-blue-600 dark:text-blue-400"
              />
              <TextDecryption
                text="Fetching data from server..."
                sequential={true}
                speed={90}
                animateOn="view"
                loop={true}
                loopDelay={2800}
                className="text-yellow-600 dark:text-yellow-400"
              />
              <TextDecryption
                text="Almost ready!"
                sequential={true}
                speed={60}
                animateOn="view"
                loop={true}
                loopDelay={2200}
                className="text-green-600 dark:text-green-400"
              />
            </div>
          </div>

          {/* Hero Section */}
          <div className="p-8 border border-border rounded-xl bg-card">
            <h3 className="text-xl font-medium text-card-foreground mb-4">
              Hero Section
            </h3>
            <div className="space-y-4 mb-6">
              <TextDecryption
                text="Welcome to the Future"
                sequential={true}
                revealDirection="center"
                speed={120}
                glowEffect={true}
                animateOn="view"
                loop={true}
                loopDelay={4000}
                className="text-green-600 dark:text-green-400 text-2xl font-bold"
              />
              <TextDecryption
                text="Experience next-generation technology"
                sequential={true}
                speed={60}
                animateOn="view"
                loop={true}
                loopDelay={3500}
                className="text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ultimate Showcase */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-primary mb-3">
            Ultimate Showcase
          </h2>
          <p className="text-muted-foreground">
            All effects combined for maximum impact
          </p>
        </div>

        <div className="p-12 border-2 border-primary rounded-2xl bg-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 animate-pulse"></div>
          <div className="relative text-center space-y-6">
            <TextDecryption
              text="🚀 ADVANCED DECRYPTION PROTOCOL ACTIVATED 🚀"
              sequential={true}
              revealDirection="center"
              speed={100}
              glowEffect={true}
              typewriterEffect={true}
              animateOn="view"
              loop={true}
              loopDelay={5000}
              className="text-green-600 dark:text-green-400 text-3xl font-bold tracking-wider"
              encryptedClassName="text-red-600 dark:text-red-400 opacity-60"
            />
            <div className="text-sm text-muted-foreground font-mono bg-muted/50 p-4 rounded-lg backdrop-blur">
              {`<TextDecryption
  text="🚀 ADVANCED DECRYPTION PROTOCOL ACTIVATED 🚀"
  sequential={true}
  revealDirection="center"
  speed={100}
  glowEffect={true}
  typewriterEffect={true}
  animateOn="view"
  loop={true}
  loopDelay={5000}
  className="text-green-400 text-3xl font-bold"
  encryptedClassName="text-red-500 opacity-60"
/>`}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TextDecryptionTheme() {
  return (
      <TextDecryption
        text="I decrypt when you see me"
        sequential={true}
        revealDirection="start"
        speed={120}
        animateOn="view"
        loop={true}
        loopDelay={1000}
        className="text-blue-600 dark:text-blue-400 text-xl"
      />
  );
}
