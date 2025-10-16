"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface SkeletonProps {
  /**
   * Width of the skeleton element. Can be a string (CSS value) or number (pixels)
   */
  width?: string | number;
  /**
   * Height of the skeleton element. Can be a string (CSS value) or number (pixels)
   */
  height?: string | number;
  /**
   * Border radius of the skeleton element
   */
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  /**
   * Animation type for the skeleton loading effect
   */
  animation?: "pulse" | "wave" | "none";
  /**
   * Additional class names for the skeleton element
   */
  className?: string;
}

/**
 * A versatile skeleton loading component for creating placeholder UI
 */
export default function Skeleton({
  width = "100%",
  height = "1rem",
  radius = "md",
  animation = "pulse",
  className,
}: SkeletonProps) {
  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <motion.div
      className={cn(
        "bg-gradient-to-r from-muted via-muted/70 to-muted",
        "dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
        radiusClasses[radius],
        animation === "pulse" && "animate-pulse",
        animation === "wave" && "animate-shimmer",
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    />
  );
}

/**
 * A beautiful profile card skeleton with animated loading states
 */
export function ProfileCardSkeleton() {
  return (
    <motion.div
      className="w-full max-w-md mx-auto bg-card border border-border/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm"
      initial={{ opacity: 0, y: 32, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header with avatar and basic info */}
      <div className="flex items-center space-x-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            type: "spring",
            stiffness: 200,
          }}
        >
          <Skeleton
            width={80}
            height={80}
            radius="full"
            className="flex-shrink-0"
          />
        </motion.div>

        <div className="flex-1 space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Skeleton width="70%" height="1.5rem" radius="md" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Skeleton width="50%" height="1rem" radius="md" />
          </motion.div>
        </div>
      </div>

      {/* Bio section */}
      <motion.div
        className="space-y-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Skeleton width="100%" height="1rem" radius="md" />
        <Skeleton width="85%" height="1rem" radius="md" />
        <Skeleton width="60%" height="1rem" radius="md" />
      </motion.div>

      {/* Stats section */}
      <motion.div
        className="grid grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="text-center space-y-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
          >
            <Skeleton width="100%" height="1.5rem" radius="md" />
            <Skeleton
              width="80%"
              height="0.875rem"
              radius="md"
              className="mx-auto"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Tags/Skills section */}
      <motion.div
        className="space-y-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        <div className="flex flex-wrap gap-2">
          {[40, 60, 35, 50, 45].map((width, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 + i * 0.1, duration: 0.3 }}
            >
              <Skeleton width={width} height="1.5rem" radius="full" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
      >
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.3 }}
        >
          <Skeleton width="100%" height="2.5rem" radius="lg" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.7, duration: 0.3 }}
        >
          <Skeleton width="2.5rem" height="2.5rem" radius="lg" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function SkeletonShowcase() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8 md:space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Profile Card Skeleton Demo */}
          <div className="space-y-4 md:space-y-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <p className="text-muted-foreground text-sm md:text-base">
                A comprehensive loading state for user profile cards
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <ProfileCardSkeleton />
            </motion.div>
          </div>

          {/* Basic Skeleton Examples */}
          <div className="space-y-4 md:space-y-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <p className="text-muted-foreground text-sm md:text-base">
                Flexible building blocks for custom loading states
              </p>
            </motion.div>

            <motion.div
              className="bg-card border border-border/50 rounded-2xl p-4 md:p-6 space-y-4 md:space-y-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {/* Text lines */}
              <div className="space-y-3 md:space-y-4">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-foreground`}>
                  Text Content
                </h3>
                <div className="space-y-2 md:space-y-3">
                  <Skeleton width="100%" height={isMobile ? "0.75rem" : "1rem"} />
                  <Skeleton width="85%" height={isMobile ? "0.75rem" : "1rem"} />
                  <Skeleton width="70%" height={isMobile ? "0.75rem" : "1rem"} />
                </div>
              </div>

              {/* Avatar examples */}
              <div className="space-y-3 md:space-y-4">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-foreground`}>Avatars</h3>
                <div className="flex items-center space-x-3 md:space-x-4">
                  <Skeleton width={isMobile ? 32 : 40} height={isMobile ? 32 : 40} radius="full" />
                  <Skeleton width={isMobile ? 40 : 50} height={isMobile ? 40 : 50} radius="full" />
                  <Skeleton width={isMobile ? 48 : 60} height={isMobile ? 48 : 60} radius="full" />
                </div>
              </div>

              {/* Button examples */}
              <div className="space-y-3 md:space-y-4">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-foreground`}>
                  Buttons & Cards
                </h3>
                <div className="space-y-2 md:space-y-3">
                  <Skeleton width={isMobile ? "100px" : "120px"} height={isMobile ? "2rem" : "2.5rem"} radius="lg" />
                  <Skeleton width="100%" height={isMobile ? "3rem" : "4rem"} radius="xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Usage Example */}
        <motion.div
          className="bg-card border border-border/50 rounded-2xl p-4 md:p-6"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-3 md:mb-4`}>Usage Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2 md:space-y-3">
              <h4 className={`font-medium text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>Basic Skeleton</h4>
              <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                <code className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground/80`}>
                  {`<Skeleton width="100%" height="1rem" />`}
                </code>
              </div>
            </div>
            <div className="space-y-2 md:space-y-3">
              <h4 className={`font-medium text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>Profile Card</h4>
              <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                <code className={`${isMobile ? 'text-xs' : 'text-sm'} text-foreground/80`}>
                  {`<ProfileCardSkeleton />`}
                </code>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function SkeletonTheme() {
  return (
    <div className="space-y-4 md:space-y-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <p className="text-muted-foreground text-sm md:text-base">
          A comprehensive loading state for user profile cards
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <ProfileCardSkeleton />
      </motion.div>
    </div>
  );
}
