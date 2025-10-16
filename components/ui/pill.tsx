import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const pillVariants = cva(
  "inline-flex items-center gap-2 md:gap-3 px-3 py-2 md:px-6 md:py-3 rounded-full border backdrop-blur-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/5 text-primary",
        secondary: "border-secondary/20 bg-secondary/5 text-secondary-foreground",
        success: "border-green-500/20 bg-green-500/5 text-green-600",
        warning: "border-yellow-500/20 bg-yellow-500/5 text-yellow-600",
        error: "border-red-500/20 bg-red-500/5 text-red-600",
        info: "border-blue-500/20 bg-blue-500/5 text-blue-600",
        outline: "border-border bg-background/50 text-foreground",
      },
      size: {
        default: "px-3 py-2 md:px-6 md:py-3 text-xs md:text-sm",
        sm: "px-2 py-1 md:px-4 md:py-2 text-xs",
        lg: "px-4 py-3 md:px-8 md:py-4 text-sm md:text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const statusVariants = cva("rounded-full", {
  variants: {
    status: {
      none: "hidden",
      active: "w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 animate-pulse",
      inactive: "w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400",
      warning: "w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-500 animate-pulse",
      error: "w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 animate-pulse",
      info: "w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 animate-pulse",
    },
  },
  defaultVariants: {
    status: "none",
  },
})

export interface PillProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillVariants> {
  icon?: React.ReactNode
  children: React.ReactNode
  status?: VariantProps<typeof statusVariants>["status"]
  asChild?: boolean
}

const Pill = React.forwardRef<HTMLDivElement, PillProps>(
  ({ className, variant, size, icon, children, status, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"

    return (
      <Comp
        ref={ref}
        data-slot="pill"
        className={cn(pillVariants({ variant, size }), className)}
        {...props}
      >
        {icon && (
          <span className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 flex items-center justify-center flex-shrink-0">
            {icon}
          </span>
        )}
        <span className="truncate">{children}</span>
        <div className={cn(statusVariants({ status }), "flex-shrink-0")} />
      </Comp>
    )
  }
)

Pill.displayName = "Pill"

export { Pill, pillVariants } 