"use client";

import type React from "react";
import { useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ToolTipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  variant?: "default" | "dark" | "gradient" | "glass" | "colorful";
  size?: "sm" | "md" | "lg";
  delayDuration?: number;
  disabled?: boolean;
  className?: string;
  maxWidth?: string;
  forceOpen?: boolean;
}

function ToolTip({
  children,
  content,
  side = "top",
  variant = "default",
  size = "md",
  delayDuration = 200,
  disabled = false,
  className,
  maxWidth = "200px",
  forceOpen = false,
}: ToolTipProps) {
  const variantStyles = {
    default: "bg-background text-foreground border border-border shadow-md",
    dark: "bg-gray-900 text-white border border-gray-700 shadow-lg",
    gradient:
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg",
    glass:
      "bg-background/80 backdrop-blur-md text-foreground border border-border/50 shadow-xl",
    colorful:
      "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-0 shadow-lg",
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip delayDuration={delayDuration} open={forceOpen ? true : undefined}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        className={cn(
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "z-50 rounded-lg",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        style={{ maxWidth }}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

// Mobile-friendly tooltip that shows/hides on tap
function MobileTooltipDemo({ 
  children, 
  content, 
  variant = "default", 
  size = "md",
  side = "top",
  maxWidth = "200px"
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  variant?: "default" | "dark" | "gradient" | "glass" | "colorful";
  size?: "sm" | "md" | "lg";
  side?: "top" | "bottom" | "left" | "right";
  maxWidth?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <ToolTip content={content} variant={variant} size={size} side={side} maxWidth={maxWidth}>
        {children}
      </ToolTip>
    );
  }

  return (
    <ToolTip 
      content={content} 
      variant={variant} 
      size={size} 
      side={side}
      maxWidth={maxWidth}
      forceOpen={isOpen}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setIsOpen(false)}
        className="cursor-pointer"
      >
        {children}
      </div>
    </ToolTip>
  );
}

export default function ToolTipShowcase() {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 md:space-y-6">
          {/* Main Demo */}
          <div className="relative p-4 md:p-8 rounded-3xl bg-card/30 backdrop-blur-sm border border-border/50 shadow-2xl">
            {isMobile && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                  💡 Tap buttons to see tooltips on mobile
                </p>
              </div>
            )}
            <div className="flex justify-center gap-3 md:gap-6 flex-wrap">
              <MobileTooltipDemo
                content="Clean default styling that adapts to your theme"
                variant="default"
                size={isMobile ? "sm" : "md"}
              >
                <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium`}>
                  Default Style
                </button>
              </MobileTooltipDemo>
              <MobileTooltipDemo
                content="Beautiful gradient styling with vibrant colors"
                variant="gradient"
                size={isMobile ? "sm" : "md"}
              >
                <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium`}>
                  Gradient Magic
                </button>
              </MobileTooltipDemo>
              <MobileTooltipDemo
                content="Glassmorphism effect with backdrop blur"
                variant="glass"
                size={isMobile ? "sm" : "md"}
              >
                <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-background/20 backdrop-blur-sm border border-border rounded-lg hover:bg-background/30 transition-all font-medium`}>
                  Glass Effect
                </button>
              </MobileTooltipDemo>
            </div>
          </div>
        </div>

        {/* Variant Styles */}
        <div className="space-y-8 md:space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Variant Styles</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Choose the perfect style for your design system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Default Variant */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-blue-700 dark:text-blue-300">
                  Default
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Theme-adaptive styling
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50/30 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-4 md:p-6 rounded-2xl border border-blue-200/30 dark:border-blue-800/20">
                <div className="text-center">
                  <MobileTooltipDemo 
                    content="Clean default styling that adapts to your theme"
                    size={isMobile ? "sm" : "md"}
                  >
                    <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium`}>
                      {isMobile ? 'Tap for Default' : 'Hover for Default'}
                    </button>
                  </MobileTooltipDemo>
                </div>
              </div>
            </div>

            {/* Dark Variant */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Dark
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Always dark theme
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50/30 to-gray-100/20 dark:from-gray-950/20 dark:to-gray-900/10 p-4 md:p-6 rounded-2xl border border-gray-200/30 dark:border-gray-800/20">
                <div className="text-center">
                  <MobileTooltipDemo
                    content="Dark themed tooltip for modern interfaces"
                    variant="dark"
                    size={isMobile ? "sm" : "md"}
                  >
                    <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium`}>
                      {isMobile ? 'Tap for Dark' : 'Hover for Dark'}
                    </button>
                  </MobileTooltipDemo>
                </div>
              </div>
            </div>

            {/* Gradient Variant */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-purple-700 dark:text-purple-300">
                  Gradient
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Vibrant gradient styling
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50/30 to-pink-100/20 dark:from-purple-950/20 dark:to-pink-900/10 p-4 md:p-6 rounded-2xl border border-purple-200/30 dark:border-purple-800/20">
                <div className="text-center">
                  <MobileTooltipDemo
                    content="Beautiful gradient styling with vibrant colors"
                    variant="gradient"
                    size={isMobile ? "sm" : "md"}
                  >
                    <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium`}>
                      {isMobile ? 'Tap for Gradient' : 'Hover for Gradient'}
                    </button>
                  </MobileTooltipDemo>
                </div>
              </div>
            </div>

            {/* Glass Variant */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-cyan-700 dark:text-cyan-300">
                  Glass
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Glassmorphism effect
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50/30 to-blue-100/20 dark:from-cyan-950/20 dark:to-blue-900/10 p-4 md:p-6 rounded-2xl border border-cyan-200/30 dark:border-cyan-800/20">
                <div className="text-center">
                  <MobileTooltipDemo
                    content="Glassmorphism effect with backdrop blur"
                    variant="glass"
                    size={isMobile ? "sm" : "md"}
                  >
                    <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-background/20 backdrop-blur-sm border border-border rounded-lg hover:bg-background/30 transition-all font-medium`}>
                      {isMobile ? 'Tap for Glass' : 'Hover for Glass'}
                    </button>
                  </MobileTooltipDemo>
                </div>
              </div>
            </div>

            {/* Colorful Variant */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-rainbow bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Colorful
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Multi-color gradient
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-100/20 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-900/10 p-4 md:p-6 rounded-2xl border border-gradient-to-r border-blue-200/30 dark:border-blue-800/20">
                <div className="text-center">
                  <MobileTooltipDemo
                    content="Vibrant multi-color gradient design"
                    variant="colorful"
                    size={isMobile ? "sm" : "md"}
                  >
                    <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform font-medium`}>
                      {isMobile ? 'Tap for Colorful' : 'Hover for Colorful'}
                    </button>
                  </MobileTooltipDemo>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Position Demonstration */}
        <div className="space-y-6 md:space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Position Options</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Tooltips can appear from any direction
            </p>
          </div>

          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-8 md:p-16 rounded-3xl border border-border/50">
            <div className="flex flex-col items-center space-y-8 md:space-y-12">
              <MobileTooltipDemo
                content="Tooltip positioned at the top"
                side="top"
                variant="gradient"
                size={isMobile ? "sm" : "md"}
              >
                <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg`}>
                  Top Position
                </button>
              </MobileTooltipDemo>

              <div className="flex space-x-8 md:space-x-16">
                <MobileTooltipDemo
                  content="Tooltip positioned to the left"
                  side="left"
                  variant="dark"
                  size={isMobile ? "sm" : "md"}
                >
                  <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg`}>
                    Left Position
                  </button>
                </MobileTooltipDemo>

                <MobileTooltipDemo
                  content="Tooltip positioned to the right"
                  side="right"
                  variant="colorful"
                  size={isMobile ? "sm" : "md"}
                >
                  <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-lg`}>
                    Right Position
                  </button>
                </MobileTooltipDemo>
              </div>

              <MobileTooltipDemo
                content="Tooltip positioned at the bottom"
                side="bottom"
                variant="glass"
                size={isMobile ? "sm" : "md"}
              >
                <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-lg`}>
                  Bottom Position
                </button>
              </MobileTooltipDemo>
            </div>
          </div>
        </div>

        {/* Size Options */}
        <div className="space-y-6 md:space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Size Variations</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Different sizes for different content amounts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="text-center space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-orange-700 dark:text-orange-300">
                Small
              </h3>
              <div className="bg-gradient-to-br from-orange-50/30 to-amber-100/20 dark:from-orange-950/20 dark:to-amber-900/10 p-4 md:p-6 rounded-2xl border border-orange-200/30 dark:border-orange-800/20">
                <MobileTooltipDemo content="Small tooltip" size="sm" variant="default">
                  <button className={`${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2'} bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors`}>
                    Small Size
                  </button>
                </MobileTooltipDemo>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-blue-700 dark:text-blue-300">
                Medium
              </h3>
              <div className="bg-gradient-to-br from-blue-50/30 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-4 md:p-6 rounded-2xl border border-blue-200/30 dark:border-blue-800/20">
                <MobileTooltipDemo
                  content="Medium sized tooltip with more content"
                  size="md"
                  variant="gradient"
                >
                  <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors`}>
                    Medium Size
                  </button>
                </MobileTooltipDemo>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-purple-700 dark:text-purple-300">
                Large
              </h3>
              <div className="bg-gradient-to-br from-purple-50/30 to-violet-100/20 dark:from-purple-950/20 dark:to-violet-900/10 p-4 md:p-6 rounded-2xl border border-purple-200/30 dark:border-purple-800/20">
                <MobileTooltipDemo
                  content="Large tooltip with even more detailed content and comprehensive information"
                  size={isMobile ? "md" : "lg"}
                  variant="colorful"
                >
                  <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-8 py-4 text-lg'} bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors`}>
                    Large Size
                  </button>
                </MobileTooltipDemo>
              </div>
            </div>
          </div>
        </div>

        {/* Rich Content */}
        <div className="space-y-6 md:space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Rich Content Examples</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Tooltips can contain complex layouts and interactive elements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="text-center space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-blue-700 dark:text-blue-300">
                User Profile
              </h3>
              <div className="bg-gradient-to-br from-blue-50/30 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-4 md:p-6 rounded-2xl border border-blue-200/30 dark:border-blue-800/20">
                <MobileTooltipDemo
                  content={
                    <div className="space-y-2">
                      <div className="font-semibold">User Profile</div>
                      <div className="text-sm opacity-90">John Doe</div>
                      <div className="text-xs opacity-75">
                        Software Engineer
                      </div>
                    </div>
                  }
                  variant="dark"
                  maxWidth="180px"
                  size={isMobile ? "sm" : "md"}
                >
                  <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-110 transition-transform mx-auto ${isMobile ? 'text-sm' : ''}`}>
                    JD
                  </div>
                </MobileTooltipDemo>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-green-700 dark:text-green-300">
                Status Indicator
              </h3>
              <div className="bg-gradient-to-br from-green-50/30 to-emerald-100/20 dark:from-green-950/20 dark:to-emerald-900/10 p-4 md:p-6 rounded-2xl border border-green-200/30 dark:border-green-800/20">
                <div className="flex justify-center">
                  <MobileTooltipDemo
                    content={
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="font-medium">Online</span>
                        </div>
                        <div className="text-sm">Last seen: Just now</div>
                      </div>
                    }
                    variant="glass"
                    side="top"
                    size={isMobile ? "sm" : "md"}
                  >
                    <div className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} bg-green-400 rounded-full cursor-pointer hover:scale-125 transition-transform`}></div>
                  </MobileTooltipDemo>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-purple-700 dark:text-purple-300">
                Progress Tracker
              </h3>
              <div className="bg-gradient-to-br from-purple-50/30 to-violet-100/20 dark:from-purple-950/20 dark:to-violet-900/10 p-4 md:p-6 rounded-2xl border border-purple-200/30 dark:border-purple-800/20">
                <MobileTooltipDemo
                  content={
                    <div className="space-y-2">
                      <div className="font-medium">Progress: 75%</div>
                      <div className={`${isMobile ? 'w-24 h-1.5' : 'w-32 h-2'} bg-gray-200 rounded-full overflow-hidden`}>
                        <div className="w-3/4 h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                      </div>
                      <div className="text-xs opacity-75">
                        3 of 4 tasks completed
                      </div>
                    </div>
                  }
                  variant="gradient"
                  side="top"
                  maxWidth="180px"
                  size={isMobile ? "sm" : "md"}
                >
                  <div className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors`}>
                    Project Status
                  </div>
                </MobileTooltipDemo>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToolTipTheme() {
  const isMobile = useIsMobile();
  
  return (
    <div className="text-center space-y-4 md:space-y-6">
      {/* Main Demo */}
      <div className="relative p-4 md:p-8 rounded-3xl bg-card/30 backdrop-blur-sm border border-border/50 shadow-2xl">
        {isMobile && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              💡 Tap buttons to see tooltips on mobile
            </p>
          </div>
        )}
        <div className="flex justify-center gap-3 md:gap-6 flex-wrap">
          <MobileTooltipDemo
            content="Clean default styling that adapts to your theme"
            variant="default"
            size={isMobile ? "sm" : "md"}
          >
            <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium`}>
              Default Style
            </button>
          </MobileTooltipDemo>
          <MobileTooltipDemo
            content="Beautiful gradient styling with vibrant colors"
            variant="gradient"
            size={isMobile ? "sm" : "md"}
          >
            <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium`}>
              Gradient Magic
            </button>
          </MobileTooltipDemo>
          <MobileTooltipDemo
            content="Glassmorphism effect with backdrop blur"
            variant="glass"
            size={isMobile ? "sm" : "md"}
          >
            <button className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-background/20 backdrop-blur-sm border border-border rounded-lg hover:bg-background/30 transition-all font-medium`}>
              Glass Effect
            </button>
          </MobileTooltipDemo>
        </div>
      </div>
    </div>
  );
}
