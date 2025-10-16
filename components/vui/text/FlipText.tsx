"use client";

import { useState, useCallback } from "react";


type FlipEffect = "basic" | "rotate" | "wave" | "slide";

interface FlipTextProps {
  children: string;
  effect?: FlipEffect;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  delay?: number;
  staggerDelay?: number;
  hoverText?: string;
  enableGlow?: boolean;
  preserveSpaces?: boolean;
  ariaLabel?: string;
  reducedMotion?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export function FlipText({
  children,
  effect = "basic",
  className = "",
  style = {},
  duration = 500,
  delay = 0,
  staggerDelay = 50,
  hoverText,
  enableGlow = false,
  preserveSpaces = true,
  ariaLabel,
  reducedMotion = false,
  onHoverStart,
  onHoverEnd,
}: FlipTextProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Respect user's reduced motion preference
  const shouldReduceMotion =
    reducedMotion ||
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHoverStart?.();
  }, [onHoverStart]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  // Get effect-specific styles for characters
  const getCharacterStyle = useCallback((index: number) => {
    if (shouldReduceMotion) {
      return {
        transition: `all 0.1s ease`,
        color: isHovered ? "rgb(59, 130, 246)" : "inherit",
      };
    }

    const baseStyle = {
      transition: `all ${duration}ms ease-out`,
      transitionDelay: `${delay + index * staggerDelay}ms`,
    };

    switch (effect) {
      case "rotate":
        return {
          ...baseStyle,
          transformStyle: "preserve-3d" as const,
          transform: isHovered
            ? "rotateX(360deg) scale(1.1)"
            : "rotateX(0deg) scale(1)",
          color: isHovered ? "rgb(59, 130, 246)" : "inherit",
          textShadow: isHovered && enableGlow
            ? "0 2px 8px rgba(59, 130, 246, 0.3)"
            : "none",
        };

      case "wave":
        return {
          ...baseStyle,
          transform: isHovered
            ? `translateY(-${Math.sin(index * 0.5) * 8}px) rotate(${
                Math.sin(index * 0.3) * 5
              }deg)`
            : "translateY(0px) rotate(0deg)",
        };

      case "slide":
        return {
          ...baseStyle,
          transform: isHovered
            ? "translateY(-100%) scale(1.05)"
            : "translateY(0) scale(1)",
          opacity: isHovered ? 0 : 1,
        };

      default: // basic
        return {
          ...baseStyle,
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          color: isHovered ? "rgb(59, 130, 246)" : "inherit",
          textShadow: isHovered && enableGlow
            ? "0 0 10px currentColor"
            : "none",
        };
    }
  }, [effect, isHovered, duration, delay, staggerDelay, enableGlow, shouldReduceMotion]);

  // Get container styles
  const getContainerStyle = useCallback(() => {
    const baseStyle = {
      ...style,
      perspective: effect === "rotate" ? "1000px" : undefined,
      filter: enableGlow && isHovered ? "brightness(1.2)" : style.filter,
    };

    if (effect === "slide" && hoverText) {
      return {
        ...baseStyle,
        position: "relative" as const,
        overflow: "hidden",
      };
    }

    return baseStyle;
  }, [effect, hoverText, enableGlow, isHovered, style]);

  // Accessibility attributes
  const accessibilityProps = {
    "aria-label": ariaLabel || `Text with ${effect} flip effect`,
    role: "text" as const,
  };

  const displayText = hoverText && isHovered && effect === "slide" ? hoverText : children;

  return (
    <span
      className={`inline-block cursor-pointer ${className}`}
      style={getContainerStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...accessibilityProps}
    >
      {displayText.split("").map((char, index) => (
        <span
          key={index}
          className="inline-block origin-center"
          style={getCharacterStyle(index)}
        >
          {char === " " && preserveSpaces ? "\u00A0" : char}
        </span>
      ))}
      
      {/* Hover text for slide effect */}
      {effect === "slide" && hoverText && (
        <span
          className="absolute top-0 left-0 inline-block"
          style={{
            transform: isHovered ? "translateY(0) scale(1.05)" : "translateY(100%) scale(1)",
            opacity: isHovered ? 1 : 0,
            transition: `all ${duration}ms ease-out`,
            transitionDelay: `${delay}ms`,
          }}
        >
          {hoverText.split("").map((char, index) => (
            <span
              key={`hover-${index}`}
              className="inline-block"
              style={{
                transitionDelay: `${delay + index * staggerDelay}ms`,
              }}
            >
              {char === " " && preserveSpaces ? "\u00A0" : char}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

// Showcase component for the component mapping
export default function FlipTextShowcase() {
  return (
    <div className="space-y-8 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Rotate Effect</h3>
          <div className="text-3xl font-bold text-blue-600">
            <FlipText effect="rotate" enableGlow>Spin Around</FlipText>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Custom Timing</h3>
          <div className="text-3xl font-bold text-orange-600">
            <FlipText effect="rotate" duration={800} staggerDelay={100}>
              Slow Motion
            </FlipText>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlipTextTheme() {
  return (
    <>
      <FlipText effect="rotate">Flip Text</FlipText>
    </>
  );
}
  