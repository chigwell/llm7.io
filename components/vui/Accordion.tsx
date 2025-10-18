"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Single accordion item definition
 */
export interface AccordionItem {
  /**
   * Unique identifier for the item. Required for proper ARIA wiring and state management
   */
  id: string;
  /**
   * Header content shown in the trigger button (e.g., a string or any React node)
   */
  header: React.ReactNode;
  /**
   * Body content revealed when the item is expanded. Accepts any React node
   */
  content: React.ReactNode;
}

export interface AccordionProps {
  /**
   * Array of accordion items to render
   */
  items: AccordionItem[];
  allowMultiple?: boolean;
  /**
   * Array of item IDs that should be open by default
   */
  defaultOpenIds?: string[];
  /**
   * Additional class names for the root element
   */
  className?: string;
}

/**
 * Mobile-optimized, accessible, animated accordion component
 */
export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className,
}: AccordionProps) {
  // Using a Set for constant-time lookups when toggling/opening panels
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenIds));

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  return (
    <motion.div
      className={cn(
        // Mobile-first responsive design
        "w-full max-w-none mx-auto rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden",
        // Tablet and up
        "sm:max-w-[90vw] sm:rounded-2xl",
        // Desktop
        "lg:w-[600px] lg:max-w-[600px]",
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id);
        const buttonId = `accordion-trigger-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <motion.div
            key={item.id}
            className="relative border-b border-border/30 last:border-b-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
          >
            {/* Decorative gradient line - hidden on mobile for cleaner look */}
            <motion.div
              className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent hidden sm:block"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                delay: index * 0.15 + 0.4,
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />

            {/* Vertical accent line - simplified for mobile */}
            <motion.div
              className="absolute left-2 sm:left-4 top-0 w-0.5 h-full bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 rounded-full"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{
                delay: index * 0.15 + 0.6,
                duration: 0.6,
                ease: "easeOut",
              }}
            />

            <h3 className="relative">
              <motion.button
                id={buttonId}
                type="button"
                className={cn(
                  "group relative w-full flex items-center justify-between gap-3",
                  // Mobile-optimized touch targets and spacing
                  "py-5 pl-6 pr-4 min-h-[60px]",
                  // Tablet and up
                  "sm:py-6 sm:pl-10 sm:pr-6 sm:min-h-[72px]",
                  // Desktop
                  "lg:pl-12 lg:pr-8",
                  "text-left font-medium text-foreground",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "transition-all duration-200 hover:bg-muted/30",
                  // Mobile-specific active states
                  "active:bg-muted/50 active:scale-[0.99]"
                )}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.15 + 0.8,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  className={cn(
                    "font-semibold tracking-tight flex-1 min-w-0 pr-2",
                    // Mobile-first typography
                    "text-base leading-snug",
                    // Tablet and up
                    "sm:text-lg sm:leading-relaxed",
                    // Desktop
                    "lg:text-xl"
                  )}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.15 + 1.0,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  {item.header}
                </motion.span>

                <motion.div
                  className={cn(
                    "relative flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 group-active:bg-primary/30 transition-colors duration-200 flex-shrink-0",
                    // Mobile-optimized touch target
                    "w-10 h-10 min-w-[40px]",
                    // Tablet and up
                    "sm:w-12 sm:h-12 sm:min-w-[48px]"
                  )}
                  initial={{ opacity: 0, scale: 0, rotate: -90 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: isOpen ? 180 : 0,
                  }}
                  transition={{
                    opacity: { delay: index * 0.15 + 1.2, duration: 0.2 },
                    scale: {
                      delay: index * 0.15 + 1.2,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 200,
                    },
                    rotate: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </motion.div>
              </motion.button>
            </h3>

            <div className="overflow-hidden w-full">
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={cn(
                      "relative w-full box-border",
                      // Mobile-optimized spacing
                      "pl-6 pr-4 pb-6 pt-2",
                      // Tablet and up
                      "sm:pl-10 sm:pr-6 sm:pb-8 sm:pt-3",
                      // Desktop
                      "lg:pl-12 lg:pr-8"
                    )}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -5, height: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      height: { duration: 0.4 },
                    }}
                  >
                    {/* Vertical accent line for content */}
                    <div className="absolute left-2 sm:left-4 top-0 w-0.5 h-full bg-gradient-to-b from-primary/40 to-transparent rounded-full" />

                    <div
                      className={cn(
                        "text-muted-foreground leading-relaxed w-full overflow-hidden",
                        // Mobile-first content spacing
                        "pl-4 text-sm min-h-[80px]",
                        // Tablet and up
                        "sm:pl-6 sm:text-base sm:min-h-[100px]",
                        // Desktop
                        "lg:text-base"
                      )}
                    >
                      <div className="w-full overflow-hidden break-words">
                        {item.content}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function AccordionShowcase() {
  return (
    <div className="min-h-1.5 bg-gradient-to-br from-background via-muted/20 to-background p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-16">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="relative p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-card/30 backdrop-blur-sm border border-border/50 shadow-2xl">
            <div className="flex justify-center">
              <Accordion
                items={[
                  {
                    id: "demo-1",
                    header: "🚀 Mobile-First Design",
                    content: (
                      <div className="space-y-3 sm:space-y-4">
                        <p className="text-muted-foreground">
                          Optimized for touch interactions with larger tap
                          targets, improved spacing, and mobile-first responsive
                          design that scales beautifully across all devices.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 sm:px-3 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                            Touch Optimized
                          </span>
                          <span className="px-2 py-1 sm:px-3 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                            Responsive
                          </span>
                          <span className="px-2 py-1 sm:px-3 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                            Fast
                          </span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: "demo-2",
                    header: "✨ Smooth Mobile Animations",
                    content: (
                      <div className="space-y-3">
                        <p className="text-muted-foreground">
                          Optimized animations that perform smoothly on mobile
                          devices with reduced motion complexity and faster
                          transitions for better user experience.
                        </p>
                        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                          <code className="text-xs sm:text-sm text-foreground/80 break-all">
                            {"duration: 0.3s + spring(200)"}
                          </code>
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: "demo-3",
                    header: "📱 Enhanced Touch Experience",
                    content: (
                      <div className="space-y-3">
                        <p className="text-muted-foreground">
                          Larger touch targets, improved active states, and
                          mobile-specific interactions for the best possible
                          touch experience.
                        </p>
                        <ul className="space-y-2 ml-2 sm:ml-4">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              60px minimum touch targets
                            </span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              Active state feedback
                            </span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              Optimized spacing
                            </span>
                          </li>
                        </ul>
                      </div>
                    ),
                  },
                ]}
                defaultOpenIds={[]}
                allowMultiple={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccordionTheme() {
  return (
    <div className="p-4 sm:p-0">
      <Accordion
        items={[
          {
            id: "demo-1",
            header: "🚀 Mobile-First Design",
            content: (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-muted-foreground">
                  Built with mobile users in mind, featuring optimized touch
                  targets, improved spacing, and responsive design that works
                  perfectly on any device size.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 sm:px-3 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                    Touch Friendly
                  </span>
                  <span className="px-2 py-1 sm:px-3 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                    Responsive
                  </span>
                  <span className="px-2 py-1 sm:px-3 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                    Accessible
                  </span>
                </div>
              </div>
            ),
          },
          {
            id: "demo-2",
            header: "✨ Optimized Performance",
            content: (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Streamlined animations and optimized rendering for smooth
                  performance on mobile devices, with reduced complexity where
                  it matters most.
                </p>
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                  <code className="text-xs sm:text-sm text-foreground/80">
                    {"mobile: { duration: 0.3, spring: 200 }"}
                  </code>
                </div>
              </div>
            ),
          },
          {
            id: "demo-3",
            header: "🎯 Enhanced Accessibility",
            content: (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Full ARIA support with mobile-optimized focus management,
                  larger touch targets, and improved screen reader experience.
                </p>
                <ul className="space-y-2 ml-2 sm:ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      WCAG 2.1 compliant touch targets
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Enhanced focus indicators
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Screen reader optimized
                    </span>
                  </li>
                </ul>
              </div>
            ),
          },
        ]}
        defaultOpenIds={[]}
      />
    </div>
  );
}
