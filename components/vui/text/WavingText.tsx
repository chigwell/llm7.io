"use client";

import { motion, HTMLMotionProps, TargetAndTransition } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

interface WaveVariant extends TargetAndTransition {
  y?: number[];
  rotate?: number[];
  scale?: number[];
  x?: number[];
}

interface WavingTextProps extends Omit<HTMLMotionProps<"div">, "children"> {
  text: string | string[];
  variant?:
    | "sine"
    | "bounce"
    | "elastic"
    | "rotate"
    | "scale"
    | "float"
    | "dance"
    | "quantum";
  intensity?: "subtle" | "normal" | "strong" | "extreme";
  speed?: number;
  direction?: "forward" | "reverse" | "alternate";
  stagger?: number;
  trigger?: "none" | "hover" | "view" | "continuous";
  loop?: boolean;
  className?: string;
  letterClassName?: string;
  wordClassName?: string;
  containerClassName?: string;
  animateAsWords?: boolean;
  preserveSpaces?: boolean;
  viewTriggerOptions?: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  };
  customWave?: WaveVariant;
  duration?: number;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}

// Predefined wave variants with different intensities
const waveVariants = {
  sine: {
    subtle: { y: [0, -3, 0, 3, 0] },
    normal: { y: [0, -8, 0, 8, 0] },
    strong: { y: [0, -15, 0, 15, 0] },
    extreme: { y: [0, -25, 0, 25, 0] },
  },
  bounce: {
    subtle: { y: [0, -5, 0], scale: [1, 1.05, 1] },
    normal: { y: [0, -12, 0], scale: [1, 1.1, 1] },
    strong: { y: [0, -20, 0], scale: [1, 1.15, 1] },
    extreme: { y: [0, -30, 0], scale: [1, 1.25, 1] },
  },
  elastic: {
    subtle: { y: [0, -4, 0, -2, 0], scale: [1, 1.02, 1, 1.01, 1] },
    normal: { y: [0, -10, 0, -5, 0], scale: [1, 1.05, 1, 1.03, 1] },
    strong: { y: [0, -18, 0, -8, 0], scale: [1, 1.1, 1, 1.05, 1] },
    extreme: { y: [0, -28, 0, -12, 0], scale: [1, 1.2, 1, 1.1, 1] },
  },
  rotate: {
    subtle: { rotate: [0, 3, -3, 0], y: [0, -2, 0] },
    normal: { rotate: [0, 8, -8, 0], y: [0, -5, 0] },
    strong: { rotate: [0, 15, -15, 0], y: [0, -10, 0] },
    extreme: { rotate: [0, 25, -25, 0], y: [0, -15, 0] },
  },
  scale: {
    subtle: { scale: [1, 1.05, 1], y: [0, -2, 0] },
    normal: { scale: [1, 1.15, 1], y: [0, -5, 0] },
    strong: { scale: [1, 1.25, 1], y: [0, -8, 0] },
    extreme: { scale: [1, 1.4, 1], y: [0, -12, 0] },
  },
  float: {
    subtle: { y: [0, -3, 0, 3, 0], x: [0, 1, 0, -1, 0] },
    normal: { y: [0, -8, 0, 8, 0], x: [0, 3, 0, -3, 0] },
    strong: { y: [0, -15, 0, 15, 0], x: [0, 5, 0, -5, 0] },
    extreme: { y: [0, -25, 0, 25, 0], x: [0, 8, 0, -8, 0] },
  },
  dance: {
    subtle: {
      y: [0, -4, 0, -2, 0],
      rotate: [0, 2, -2, 1, 0],
      scale: [1, 1.02, 1],
    },
    normal: {
      y: [0, -10, 0, -5, 0],
      rotate: [0, 5, -5, 3, 0],
      scale: [1, 1.05, 1],
    },
    strong: {
      y: [0, -18, 0, -8, 0],
      rotate: [0, 10, -10, 5, 0],
      scale: [1, 1.1, 1],
    },
    extreme: {
      y: [0, -25, 0, -12, 0],
      rotate: [0, 20, -20, 10, 0],
      scale: [1, 1.2, 1],
    },
  },
  quantum: {
    subtle: {
      y: [0, -2, 0, 2, 0],
      x: [0, 1, 0, -1, 0],
      scale: [1, 1.01, 1, 1.01, 1],
      rotate: [0, 1, -1, 0],
    },
    normal: {
      y: [0, -6, 0, 6, 0],
      x: [0, 2, 0, -2, 0],
      scale: [1, 1.03, 1, 1.03, 1],
      rotate: [0, 3, -3, 0],
    },
    strong: {
      y: [0, -12, 0, 12, 0],
      x: [0, 4, 0, -4, 0],
      scale: [1, 1.08, 1, 1.08, 1],
      rotate: [0, 8, -8, 0],
    },
    extreme: {
      y: [0, -20, 0, 20, 0],
      x: [0, 6, 0, -6, 0],
      scale: [1, 1.15, 1, 1.15, 1],
      rotate: [0, 15, -15, 0],
    },
  },
};

const WavingText = ({
  text,
  variant = "sine",
  intensity = "normal",
  speed = 2,
  direction = "forward",
  stagger = 0.1,
  trigger = "continuous",
  loop = true,
  className,
  letterClassName,
  wordClassName,
  containerClassName,
  animateAsWords = false,
  preserveSpaces = true,
  viewTriggerOptions = {},
  customWave,
  duration,
  onAnimationStart,
  onAnimationComplete,
  ...props
}: WavingTextProps) => {
  const [isVisible, setIsVisible] = useState(trigger !== "view");
  const [isHovering, setIsHovering] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const texts = Array.isArray(text) ? text : [text];
  const currentText = texts[currentTextIndex];

  // Cycle through texts if multiple provided
  useEffect(() => {
    if (
      texts.length > 1 &&
      (trigger === "continuous" || (trigger === "view" && isVisible))
    ) {
      const interval = setInterval(() => {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
      }, (duration || speed * 1000) * 2);
      return () => clearInterval(interval);
    }
  }, [texts.length, trigger, isVisible, speed, duration]);

  // Intersection Observer for view trigger
  useEffect(() => {
    if (trigger !== "view") return;

    const {
      threshold = 0.1,
      rootMargin = "0px",
      triggerOnce = false,
    } = viewTriggerOptions;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onAnimationStart?.();
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [trigger, viewTriggerOptions, onAnimationStart]);

  // Get animation variant
  const getAnimationVariant = (): WaveVariant => {
    if (customWave) return customWave;

    // Ensure variant and intensity exist in waveVariants
    if (waveVariants[variant] && waveVariants[variant][intensity]) {
      return waveVariants[variant][intensity];
    }

    // Fallback to default
    return waveVariants.sine.normal;
  };

  // Get initial state (neutral position)
  const getInitialVariant = () => {
    return { y: 0, x: 0, scale: 1, rotate: 0 };
  };

  // Determine if animation should play
  const shouldAnimate = () => {
    switch (trigger) {
      case "hover":
        return isHovering;
      case "view":
        return isVisible;
      case "continuous":
        return true;
      case "none":
        return false;
      default:
        return true;
    }
  };

  // Create animation transition
  const createTransition = (index: number) => {
    const baseDelay =
      direction === "reverse"
        ? (animateAsWords
            ? currentText.split(" ").length - index - 1
            : currentText.length - index - 1) * stagger
        : index * stagger;

    const transition = {
      duration: duration || speed,
      repeat: loop ? Infinity : 0,
      repeatType: (direction === "alternate" ? "reverse" : "loop") as
        | "loop"
        | "reverse"
        | "mirror",
      delay: baseDelay,
      ease: "easeInOut" as const,
    };

    return transition;
  };

  // Split text into units (letters or words)
  // Properly handles emojis and Unicode characters
  const splitTextIntoUnits = (text: string): string[] => {
    if (animateAsWords) {
      return preserveSpaces ? text.split(/(\s+)/) : text.split(" ");
    }
    // Use Array.from() or spread operator to properly handle Unicode characters including emojis
    const characters = Array.from(text);
    return preserveSpaces ? characters : characters.filter(char => !/\s/.test(char));
  };

  const textUnits = splitTextIntoUnits(currentText);
  const animationVariant = getAnimationVariant();

  const hoverProps =
    trigger === "hover"
      ? {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        }
      : {};

  return (
    <motion.div
      ref={containerRef}
      className={cn("inline-flex items-baseline", containerClassName)}
      {...hoverProps}
      {...props}
    >
      {textUnits.map((unit, index) => {
        const isSpace = unit.trim() === "";
        const shouldSkipAnimation = isSpace && !preserveSpaces;

        if (isSpace && preserveSpaces) {
          return (
            <span key={`space-${index}`} className="whitespace-pre">
              {unit}
            </span>
          );
        }

        if (shouldSkipAnimation) {
          return null;
        }

        return (
        <motion.span
            key={`${currentTextIndex}-${index}-${unit}`}
            className={cn(
              "inline-block",
              animateAsWords ? wordClassName : letterClassName,
              className
            )}
            initial={getInitialVariant()}
            animate={shouldAnimate() ? animationVariant : getInitialVariant()}
            transition={createTransition(index)}
            onAnimationComplete={index === 0 ? onAnimationComplete : undefined}
            style={{
              transformOrigin: "center center",
            }}
          >
            {unit}
        </motion.span>
        );
      })}
    </motion.div>
  );
};

export default WavingText;

// Showcase Component
export function WavingTextShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-8">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Variant Showcase */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Animation Variants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(waveVariants).map((variantKey) => (
              <div
                key={variantKey}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground capitalize">
                    {variantKey}
                  </h3>
                  <div className="h-16 flex items-center justify-center">
                    <WavingText
                      text={`${
                        variantKey.charAt(0).toUpperCase() + variantKey.slice(1)
                      } Wave`}
                      variant={
                        variantKey as
                          | "sine"
                          | "bounce"
                          | "elastic"
                          | "rotate"
                          | "scale"
                          | "float"
                          | "dance"
                          | "quantum"
                      }
                      intensity="normal"
                      speed={2}
                      stagger={0.1}
                      className="text-primary font-medium"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {variantKey === "sine" && "Classic sine wave motion"}
                    {variantKey === "bounce" && "Energetic bouncing effect"}
                    {variantKey === "elastic" && "Spring-like elasticity"}
                    {variantKey === "rotate" && "Rotating wave motion"}
                    {variantKey === "scale" && "Scaling transformation"}
                    {variantKey === "float" && "Floating in all directions"}
                    {variantKey === "dance" && "Combined dance movements"}
                    {variantKey === "quantum" && "Multi-dimensional chaos"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Intensity Levels */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Intensity Levels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(["subtle", "normal", "strong", "extreme"] as const).map(
              (intensityLevel) => (
                <div
                  key={intensityLevel}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground capitalize">
                      {intensityLevel}
                    </h3>
                    <div className="h-16 flex items-center justify-center">
                      <WavingText
                        text="Wave Text"
                        variant="bounce"
                        intensity={intensityLevel}
                        speed={2}
                        stagger={0.15}
                        className={cn(
                          "font-semibold",
                          intensityLevel === "subtle" && "text-blue-500",
                          intensityLevel === "normal" && "text-green-500",
                          intensityLevel === "strong" && "text-orange-500",
                          intensityLevel === "extreme" && "text-red-500"
                        )}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Trigger Types */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Animation Triggers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Continuous */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50/50 to-emerald-100/30 dark:from-green-950/30 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/30">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                    Continuous
                  </h3>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                    AUTO
                  </span>
                </div>
                <div className="h-16 flex items-center justify-center">
                  <WavingText
                    text="Always Waving!"
                    variant="sine"
                    intensity="normal"
                    speed={2}
                    trigger="continuous"
                    className="text-green-600 dark:text-green-400 font-medium"
                  />
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Animations run continuously
                </p>
              </div>
            </div>

            {/* Hover */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    Hover
                  </h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    HOVER
                  </span>
                </div>
                <div className="h-16 flex items-center justify-center">
                  <WavingText
                    text="Hover over me!"
                    variant="bounce"
                    intensity="strong"
                    speed={1.5}
                    trigger="hover"
                    className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer"
                  />
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Waves on mouse hover
                </p>
              </div>
            </div>

            {/* View */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-violet-100/30 dark:from-purple-950/30 dark:to-violet-900/20 border border-purple-200/50 dark:border-purple-800/30">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                    On View
                  </h3>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                    VIEW
                  </span>
                </div>
                <div className="h-16 flex items-center justify-center">
                  <WavingText
                    text="Scroll to see me!"
                    variant="elastic"
                    intensity="normal"
                    speed={2}
                    trigger="view"
                    className="text-purple-600 dark:text-purple-400 font-medium"
                  />
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Animates when in viewport
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Advanced Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Word Animation */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Word-based Animation
                </h3>
                <div className="h-20 flex items-center justify-center">
                  <WavingText
                    text="Each word waves separately!"
                    variant="rotate"
                    intensity="normal"
                    speed={2}
                    animateAsWords={true}
                    stagger={0.3}
                    className="text-orange-500 font-medium text-lg"
                  />
                </div>
                <div className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
                  {`<WavingText 
  text="Each word waves separately!" 
  animateAsWords={true} 
  stagger={0.3} 
/>`}
                </div>
              </div>
            </div>

            {/* Multiple Texts */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Multiple Texts
                </h3>
                <div className="h-20 flex items-center justify-center">
                  <WavingText
                    text={["First Message", "Second Message", "Third Message"]}
                    variant="dance"
                    intensity="normal"
                    speed={2}
                    stagger={0.1}
                    className="text-pink-500 font-medium text-lg"
                  />
                </div>
                <div className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
                  {`<WavingText 
  text={["First Message", "Second Message", "Third Message"]} 
  variant="dance" 
/>`}
                </div>
              </div>
            </div>

            {/* Direction Control */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">
                  Direction Control
                </h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Forward
                    </p>
                    <div className="h-16 flex items-center justify-center">
                      <WavingText
                        text="Left to Right"
                        variant="scale"
                        direction="forward"
                        stagger={0.15}
                        speed={2}
                        trigger="continuous"
                        intensity="normal"
                        className="text-cyan-500 font-medium text-lg"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Reverse
                    </p>
                    <div className="h-16 flex items-center justify-center">
                      <WavingText
                        text="Right to Left"
                        variant="scale"
                        direction="reverse"
                        stagger={0.15}
                        speed={2}
                        trigger="continuous"
                        intensity="normal"
                        className="text-cyan-500 font-medium text-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
                  {`<WavingText 
  text="Left to Right" 
  direction="forward" 
  stagger={0.15} 
/>
<WavingText 
  text="Right to Left" 
  direction="reverse" 
  stagger={0.15} 
/>`}
                </div>
              </div>
            </div>

            {/* Custom Styling */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Custom Styling
                </h3>
                <div className="h-60 flex items-center justify-center">
                  <WavingText
                    text="🌊 Styled Waves 🌊"
                    variant="quantum"
                    intensity="strong"
                    speed={2}
                    stagger={0.1}
                    trigger="continuous"
                    className="text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text font-bold text-2xl"
                  />
                </div>
                <div className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
                  {`<WavingText 
  text="🌊 Styled Waves 🌊" 
  className="text-transparent bg-gradient-to-r 
    from-blue-500 via-purple-500 to-pink-500 
    bg-clip-text font-bold text-2xl" 
/>`}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Theme Component for Documentation
export function WavingTextTheme() {
  return (
    <WavingText
      text="Beautiful wave animations for your text content"
      variant="sine"
      intensity="normal"
      speed={2.5}
      stagger={0.08}
      className="text-primary font-medium"
    />
  );
}
