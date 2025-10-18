"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Menu,
  Settings,
  Camera,
  ImageIcon,
  FileText,
  BarChart3,
  Users,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet as BaseSheet,
  SheetTrigger as BaseSheetTrigger,
  SheetClose as BaseSheetClose,
  SheetContent as BaseSheetContent,
  SheetHeader as BaseSheetHeader,
  SheetFooter as BaseSheetFooter,
  SheetTitle as BaseSheetTitle,
  SheetDescription as BaseSheetDescription,
} from "@/components/ui/sheet";

/**
 * Enhanced VUI Sheet Properties
 */
export interface VUISheetProps {
  /** Which side of the screen the sheet slides from */
  side?: "top" | "right" | "bottom" | "left";
  /** Size variant for the sheet */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Enable glassmorphism effect */
  glassmorphism?: boolean;
  /** Show gradient border accent */
  showGradientBorder?: boolean;
  /** Custom className for the sheet content */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Custom animation duration */
  animationDuration?: number;
}

/**
 * Animation variants for consistent motion
 */
const animationVariants = {
  content: {
    initial: (side: string) => ({
      opacity: 0,
      y: side === "top" ? -30 : side === "bottom" ? 30 : 0,
      x: side === "left" ? -30 : side === "right" ? 30 : 0,
      scale: 0.96,
    }),
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
    },
    exit: (side: string) => ({
      opacity: 0,
      y: side === "top" ? -15 : side === "bottom" ? 15 : 0,
      x: side === "left" ? -15 : side === "right" ? 15 : 0,
      scale: 0.98,
    }),
  },
  gradientBorder: {
    initial: (side: string) => ({
      scaleY: side === "right" || side === "left" ? 0 : 1,
      scaleX: side === "top" || side === "bottom" ? 0 : 1,
      opacity: 0,
    }),
    animate: {
      scaleY: 1,
      scaleX: 1,
      opacity: 1,
    },
  },
  closeButton: {
    initial: { opacity: 0, scale: 0, rotate: -90 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 90 },
    tap: { scale: 0.95 },
  },
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
};

/**
 * Enhanced Sheet Content with VUI styling
 */
const VUISheetContent = React.forwardRef<
  React.ComponentRef<typeof BaseSheetContent>,
  React.ComponentPropsWithoutRef<typeof BaseSheetContent> & VUISheetProps
>(
  (
    {
      className,
      children,
      side = "right",
      size = "md",
      glassmorphism = true,
      showGradientBorder = true,
      animationDuration = 0.7,
      ...props
    },
    ref
  ) => {
    const getSizeClasses = React.useCallback(() => {
      const sizeMap = {
        sm: side === "right" || side === "left" ? "w-64 sm:max-w-sm" : "h-64",
        md: side === "right" || side === "left" ? "w-80 sm:max-w-md" : "h-80",
        lg: side === "right" || side === "left" ? "w-96 sm:max-w-lg" : "h-96",
        xl:
          side === "right" || side === "left"
            ? "w-[32rem] sm:max-w-2xl"
            : "h-[32rem]",
        full:
          side === "right" || side === "left"
            ? "w-full sm:max-w-none"
            : "h-full",
      };
      return sizeMap[size] || sizeMap.md;
    }, [side, size]);

    const getBorderClasses = React.useCallback(() => {
      const borderMap = {
        right: "border-l-0",
        left: "border-r-0",
        top: "border-b-0",
        bottom: "border-t-0",
      };
      return borderMap[side];
    }, [side]);

    const getGradientPosition = React.useCallback(() => {
      const positionMap = {
        right: "left-0 top-0 w-1 h-full",
        left: "right-0 top-0 w-1 h-full",
        top: "bottom-0 left-0 h-1 w-full",
        bottom: "top-0 left-0 h-1 w-full",
      };
      return positionMap[side];
    }, [side]);

    return (
      <BaseSheetContent
        ref={ref}
        side={side}
        className={cn(
          // Base styles
          "bg-background/95 border-border/50 focus:outline-none",
          glassmorphism && "backdrop-blur-xl bg-background/80",

          // Size classes
          getSizeClasses(),

          // Enhanced shadow and border
          "shadow-2xl border-2",
          showGradientBorder && "border-primary/20",

          // Position specific styles
          getBorderClasses(),

          className
        )}
        {...props}
      >
        {/* Gradient accent line */}
        <AnimatePresence>
          {showGradientBorder && (
            <motion.div
              className={cn(
                "absolute bg-gradient-to-r from-primary/60 via-primary to-primary/60 z-10",
                getGradientPosition()
              )}
              custom={side}
              variants={animationVariants.gradientBorder}
              initial="initial"
              animate="animate"
              exit="initial"
              transition={{
                delay: 0.15,
                duration: animationDuration * 1.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          )}
        </AnimatePresence>

        {/* Content wrapper with stagger animation */}
        <motion.div
          className="flex flex-col h-full relative z-20"
          custom={side}
          variants={animationVariants.content}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            delay: 0.05,
            duration: animationDuration,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          {children}
        </motion.div>

        {/* Enhanced close button */}
        <motion.div
          className="absolute top-4 right-4 z-30"
          variants={animationVariants.closeButton}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          transition={{
            delay: 0.3,
            duration: 0.5,
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        >
          <BaseSheetClose
            className={cn(
              "rounded-full w-8 h-8 flex items-center justify-center",
              "bg-muted/50 hover:bg-muted/80 backdrop-blur-sm",
              "border border-border/50 hover:border-border",
              "transition-all duration-200 ease-out",
              "focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
              "focus:outline-none group"
            )}
            aria-label="Close sheet"
          >
            <X className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </BaseSheetClose>
        </motion.div>
      </BaseSheetContent>
    );
  }
);

VUISheetContent.displayName = "VUISheetContent";

/**
 * Enhanced Sheet Header with animation
 */
const VUISheetHeader = React.forwardRef<
  React.ComponentRef<typeof BaseSheetHeader>,
  React.ComponentPropsWithoutRef<typeof BaseSheetHeader>
>(({ className, children, ...props }, ref) => (
  <BaseSheetHeader
    ref={ref}
    className={cn(
      "border-b border-border/30 bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm px-6 py-4",
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.15,
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  </BaseSheetHeader>
));

VUISheetHeader.displayName = "VUISheetHeader";

/**
 * Enhanced Sheet Footer with animation
 */
const VUISheetFooter = React.forwardRef<
  React.ComponentRef<typeof BaseSheetFooter>,
  React.ComponentPropsWithoutRef<typeof BaseSheetFooter>
>(({ className, children, ...props }, ref) => (
  <BaseSheetFooter
    ref={ref}
    className={cn(
      "border-t border-border/30 bg-gradient-to-r from-background/30 to-background/50 backdrop-blur-sm px-6 py-4",
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.25,
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  </BaseSheetFooter>
));

VUISheetFooter.displayName = "VUISheetFooter";

/**
 * Enhanced Sheet Title with gradient effect
 */
const VUISheetTitle = React.forwardRef<
  React.ComponentRef<typeof BaseSheetTitle>,
  React.ComponentPropsWithoutRef<typeof BaseSheetTitle> & {
    gradient?: boolean;
  }
>(({ className, gradient = true, children, ...props }, ref) => (
  <motion.div
    initial={{ opacity: 0, x: -12, scale: 0.98 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{
      delay: 0.2,
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    }}
  >
    <BaseSheetTitle
      ref={ref}
      className={cn(
        "text-xl font-semibold tracking-tight",
        gradient &&
          "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </BaseSheetTitle>
  </motion.div>
));

VUISheetTitle.displayName = "VUISheetTitle";

/**
 * Enhanced Sheet Description with subtle animation
 */
const VUISheetDescription = React.forwardRef<
  React.ComponentRef<typeof BaseSheetDescription>,
  React.ComponentPropsWithoutRef<typeof BaseSheetDescription>
>(({ className, children, ...props }, ref) => (
  <motion.div
    initial={{ opacity: 0, y: 3 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: 0.3,
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    }}
  >
    <BaseSheetDescription
      ref={ref}
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    >
      {children}
    </BaseSheetDescription>
  </motion.div>
));

VUISheetDescription.displayName = "VUISheetDescription";

/**
 * Enhanced Sheet Trigger with hover effects
 */
const VUISheetTrigger = React.forwardRef<
  React.ComponentRef<typeof BaseSheetTrigger>,
  React.ComponentPropsWithoutRef<typeof BaseSheetTrigger>
>(({ className, children, ...props }, ref) => (
  <BaseSheetTrigger ref={ref} className={cn("group", className)} {...props}>
    <motion.div
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  </BaseSheetTrigger>
));

VUISheetTrigger.displayName = "VUISheetTrigger";

/**
 * VUI Sheet Body for content area
 */
const VUISheetBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-auto px-6 py-4", className)}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.35,
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  </div>
));

VUISheetBody.displayName = "VUISheetBody";

/**
 * Main VUI Sheet component
 */
const VUISheet = BaseSheet;

// Export all components
export {
  VUISheet as Sheet,
  VUISheetTrigger as SheetTrigger,
  BaseSheetClose as SheetClose,
  VUISheetContent as SheetContent,
  VUISheetHeader as SheetHeader,
  VUISheetFooter as SheetFooter,
  VUISheetTitle as SheetTitle,
  VUISheetDescription as SheetDescription,
  VUISheetBody as SheetBody,
};

/**
 * Enhanced Button Component for consistent styling
 */
const EnhancedButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof motion.button> & {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
  }
>(({ className, variant = "primary", size = "md", children, ...props }, ref) => {
  const baseClasses =
    "font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/50",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-primary/50",
    ghost: "text-foreground hover:bg-muted focus:ring-muted/50",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      type="button"
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
        mass: 0.8,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

EnhancedButton.displayName = "EnhancedButton";

/**
 * Feature Card Component
 */
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => (
  <motion.div
    className={cn(
      "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
      `bg-${color}-500/10 border-${color}-500/20 hover:border-${color}-500/30`
    )}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <div className={cn("flex items-center gap-3 mb-2", `text-${color}-600`)}>
      {icon}
      <h4 className="font-medium">{title}</h4>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

/**
 * Navigation Item Component
 */
const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}> = ({ icon, label, href = "#", onClick }) => (
  <motion.a
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors group"
    whileHover={{ x: 4 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <div className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors">
      {icon}
    </div>
    <span className="text-foreground group-hover:text-foreground/90">
      {label}
    </span>
  </motion.a>
);

/**
 * Toggle Switch Component
 */
const ToggleSwitch: React.FC<{
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}> = ({ label, checked = false, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium">{label}</label>
    <motion.button
      className={cn(
        "w-11 h-6 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
        checked ? "bg-primary" : "bg-muted"
      )}
      onClick={() => onChange?.(!checked)}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  </div>
);

/**
 * VUI Sheet Showcase Component
 * Demonstrates various sheet configurations and features
 */
export function VUISheetShowcase() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <div className="min-h-5 bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12 justify-center items-center">
        {/* Sheet Variations */}
        <div className="space-y-12">
          {/* Right Side Sheets */}
          <motion.section
            className="space-y-6"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="text-2xl font-semibold">Right Side Sheets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Standard Right Sheet */}
              <VUISheet>
                <VUISheetTrigger asChild>
                  <EnhancedButton variant="primary">
                    Standard (MD)
                  </EnhancedButton>
                </VUISheetTrigger>
                <VUISheetContent side="right" size="md">
                  <VUISheetHeader>
                    <VUISheetTitle>Beautiful VUI Sheet</VUISheetTitle>
                    <VUISheetDescription>
                      This is an elegant sheet component with smooth animations
                      and glassmorphism effects.
                    </VUISheetDescription>
                  </VUISheetHeader>
                  <VUISheetBody>
                    <div className="space-y-6">
                      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                        <h3 className="font-medium mb-3 text-foreground">
                          Key Features
                        </h3>
                        <ul className="space-y-3 text-sm">
                          {[
                            "Smooth Framer Motion animations",
                            "Glassmorphism backdrop effects",
                            "Gradient border accents",
                            "Enhanced accessibility",
                            "Responsive design",
                            "TypeScript support",
                          ].map((feature, index) => (
                            <motion.li
                              key={feature}
                              className="flex items-center gap-3 text-muted-foreground"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                            >
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium block">
                          Sample Form Field
                        </label>
                        <input
                          type="text"
                          placeholder="Enter some text..."
                          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </VUISheetBody>
                  <VUISheetFooter>
                    <div className="flex gap-3 ml-auto">
                      <EnhancedButton variant="ghost" size="sm">
                        Cancel
                      </EnhancedButton>
                      <EnhancedButton variant="primary" size="sm">
                        Save Changes
                      </EnhancedButton>
                    </div>
                  </VUISheetFooter>
                </VUISheetContent>
              </VUISheet>

              {/* Large Right Sheet */}
              <VUISheet>
                <VUISheetTrigger asChild>
                  <EnhancedButton
                    variant="secondary"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Large (LG)
                  </EnhancedButton>
                </VUISheetTrigger>
                <VUISheetContent side="right" size="lg">
                  <VUISheetHeader>
                    <VUISheetTitle gradient={false}>Large Sheet</VUISheetTitle>
                    <VUISheetDescription>
                      Perfect for detailed forms and comprehensive content.
                    </VUISheetDescription>
                  </VUISheetHeader>
                  <VUISheetBody>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FeatureCard
                          icon={<BarChart3 className="w-5 h-5" />}
                          title="Analytics"
                          description="View detailed analytics and insights"
                          color="blue"
                        />
                        <FeatureCard
                          icon={<Settings className="w-5 h-5" />}
                          title="Settings"
                          description="Configure your preferences"
                          color="purple"
                        />
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-medium">Configuration</h3>
                        <div className="space-y-4">
                          <ToggleSwitch
                            label="Enable notifications"
                            checked={notifications}
                            onChange={setNotifications}
                          />
                          <ToggleSwitch
                            label="Dark mode"
                            checked={darkMode}
                            onChange={setDarkMode}
                          />
                        </div>
                      </div>
                    </div>
                  </VUISheetBody>
                </VUISheetContent>
              </VUISheet>

              {/* Small Right Sheet */}
              <VUISheet>
                <VUISheetTrigger asChild>
                  <EnhancedButton
                    variant="secondary"
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Small (SM)
                  </EnhancedButton>
                </VUISheetTrigger>
                <VUISheetContent side="right" size="sm">
                  <VUISheetHeader>
                    <VUISheetTitle>Quick Actions</VUISheetTitle>
                    <VUISheetDescription>
                      Compact sheet for quick interactions.
                    </VUISheetDescription>
                  </VUISheetHeader>
                  <VUISheetBody>
                    <div className="space-y-2">
                      {[
                        {
                          icon: <FileText className="w-4 h-4" />,
                          title: "Export Data",
                          desc: "Download your data",
                        },
                        {
                          icon: <Users className="w-4 h-4" />,
                          title: "Share",
                          desc: "Share with others",
                        },
                        {
                          icon: <X className="w-4 h-4" />,
                          title: "Delete",
                          desc: "Remove permanently",
                        },
                      ].map((action, index) => (
                        <motion.button
                          key={action.title}
                          className="w-full p-3 text-left rounded-md hover:bg-muted/50 transition-colors group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                              {action.icon}
                            </div>
                            <div className="font-medium">{action.title}</div>
                          </div>
                          <div className="text-sm text-muted-foreground ml-7">
                            {action.desc}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </VUISheetBody>
                </VUISheetContent>
              </VUISheet>
            </div>
          </motion.section>

          {/* Bottom Sheets */}
          <motion.section
            className="space-y-6"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="text-2xl font-semibold">Bottom Sheets</h2>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <VUISheet>
                <VUISheetTrigger asChild>
                  <EnhancedButton
                    variant="secondary"
                    className="bg-violet-600 text-white hover:bg-violet-700"
                  >
                    Bottom Sheet
                  </EnhancedButton>
                </VUISheetTrigger>
                <VUISheetContent side="bottom" size="lg">
                  <VUISheetHeader>
                    <VUISheetTitle gradient={false}>
                      Mobile Actions
                    </VUISheetTitle>
                    <VUISheetDescription>
                      Perfect for mobile-friendly interfaces and action panels.
                    </VUISheetDescription>
                  </VUISheetHeader>
                  <VUISheetBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FeatureCard
                        icon={<Camera className="w-5 h-5" />}
                        title="Camera"
                        description="Take a new photo"
                        color="blue"
                      />
                      <FeatureCard
                        icon={<ImageIcon className="w-5 h-5" />}
                        title="Gallery"
                        description="Choose from gallery"
                        color="green"
                      />
                      <FeatureCard
                        icon={<FileText className="w-5 h-5" />}
                        title="Documents"
                        description="Upload documents"
                        color="purple"
                      />
                    </div>
                  </VUISheetBody>
                </VUISheetContent>
              </VUISheet>

              <VUISheet>
                <VUISheetTrigger asChild>
                  <EnhancedButton
                    variant="outline"
                    className="bg-white text-rose-600 border-rose-600 hover:bg-rose-600 hover:text-white"
                  >
                    No Gradient Border
                  </EnhancedButton>
                </VUISheetTrigger>
                <VUISheetContent
                  side="bottom"
                  size="md"
                  showGradientBorder={false}
                >
                  <VUISheetHeader>
                    <VUISheetTitle>Clean Design</VUISheetTitle>
                    <VUISheetDescription>
                      Sometimes simplicity is the key to elegance.
                    </VUISheetDescription>
                  </VUISheetHeader>
                  <VUISheetBody>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        This sheet has the gradient border disabled for a
                        cleaner, more minimal look.
                      </p>
                    </div>
                  </VUISheetBody>
                </VUISheetContent>
              </VUISheet>
            </div>
          </motion.section>

          {/* Left Sheet */}
          <motion.section
            className="space-y-6"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="text-2xl font-semibold">Left Side Sheets</h2>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <VUISheet>
                <VUISheetTrigger asChild>
                  <EnhancedButton
                    variant="secondary"
                    className="bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Left Navigation
                  </EnhancedButton>
                </VUISheetTrigger>
                <VUISheetContent side="left" size="md">
                  <VUISheetHeader>
                    <VUISheetTitle>Navigation Menu</VUISheetTitle>
                    <VUISheetDescription>
                      Perfect for navigation and menu systems.
                    </VUISheetDescription>
                  </VUISheetHeader>
                  <VUISheetBody>
                    <nav className="space-y-2">
                      <NavItem icon={<Home />} label="Dashboard" />
                      <NavItem icon={<FileText />} label="Projects" />
                      <NavItem icon={<Users />} label="Team" />
                      <NavItem icon={<BarChart3 />} label="Analytics" />
                      <NavItem icon={<Settings />} label="Settings" />
                    </nav>
                  </VUISheetBody>
                </VUISheetContent>
              </VUISheet>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export default function SheetShowcase() {
  return <VUISheetShowcase />;
}
