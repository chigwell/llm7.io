"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

// Streamlined animated check icon with clean animation styles
const AnimatedCheckIcon = ({
  variant = "default",
  colorScheme = "default",
  size = "md",
}: {
  variant?: "default" | "smooth";
  colorScheme?: "default" | "success" | "warning" | "error" | "purple" | "blue";
  size?: "sm" | "md" | "lg";
}) => {
  const pathRef = React.useRef<SVGPathElement>(null);
  const [isChecked, setIsChecked] = React.useState(false);

  React.useEffect(() => {
    const checkboxElement = pathRef.current?.closest('[data-slot="checkbox"]');
    if (!checkboxElement) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-state"
        ) {
          const isNowChecked =
            checkboxElement.getAttribute("data-state") === "checked";
          setIsChecked(isNowChecked);
        }
      });
    });

    observer.observe(checkboxElement, { attributes: true });

    // Initial state check
    setIsChecked(checkboxElement.getAttribute("data-state") === "checked");

    return () => observer.disconnect();
  }, []);

  const getTickColor = () => {
    const colors = {
      default: "#1d4ed8",
      success: "#16a34a",
      warning: "#d97706",
      error: "#dc2626",
      purple: "#9333ea",
      blue: "#1d4ed8",
    };
    return colors[colorScheme];
  };

  const getSizeProps = () => {
    const sizes = {
      sm: {
        height: "8px",
        width: "10px",
        strokeWidth: "2",
        viewBox: "0 0 10 8",
        path: "M1 4L3.5 6.5L9 1",
      },
      md: {
        height: "10px",
        width: "13px",
        strokeWidth: "2.5",
        viewBox: "0 0 13 10",
        path: "M1 5.39437L4.54286 9L12 1",
      },
      lg: {
        height: "12px",
        width: "16px",
        strokeWidth: "3",
        viewBox: "0 0 16 12",
        path: "M1 6L5 10L15 1",
      },
    };
    return sizes[size];
  };

  const getAnimationStyle = () => {
    const sizeProps = getSizeProps();
    const baseStyle = {
      strokeDasharray: 20,
      strokeDashoffset: isChecked ? 0 : 20,
      stroke: getTickColor(),
      strokeWidth: sizeProps.strokeWidth,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      fill: "none",
    };

    switch (variant) {
      case "smooth":
        return {
          ...baseStyle,
          transition:
            "stroke-dashoffset 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        };
      case "default":
      default:
        return {
          ...baseStyle,
          transition: "stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        };
    }
  };

  const sizeProps = getSizeProps();

  return (
    <svg
      viewBox={sizeProps.viewBox}
      height={sizeProps.height}
      width={sizeProps.width}
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
    >
      <path ref={pathRef} d={sizeProps.path} style={getAnimationStyle()} />
    </svg>
  );
};

// Refined ripple effect component
const RippleEffect = ({ trigger }: { trigger: boolean }) => {
  const [ripples, setRipples] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (trigger) {
      const newRipple = Date.now();
      setRipples((prev) => [...prev, newRipple]);

      const timer = setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple !== newRipple));
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden rounded-[6px] pointer-events-none">
        {ripples.map((ripple) => (
          <div
            key={ripple}
            className="absolute inset-0 bg-primary/20 rounded-[6px] animate-ripple"
          />
        ))}
      </div>
      <style jsx global>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: center;
          transform: scale(0);
          opacity: 1;
        }
      `}</style>
    </>
  );
};

interface CheckboxRefinedProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label: string;
  variant?: "default" | "smooth";
  size?: "sm" | "md" | "lg";
  colorScheme?: "default" | "success" | "warning" | "error" | "purple" | "blue";
  description?: string;
  showRipple?: boolean;
}

const CheckboxRefined = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxRefinedProps
>(
  (
    {
      className,
      label,
      id,
      variant = "default",
      size = "md",
      colorScheme = "default",
      description,
      showRipple = true,
      ...props
    },
    ref
  ) => {
    const uId = React.useId();
    const checkboxId = id || uId;
    const [rippleTrigger, setRippleTrigger] = React.useState(false);

    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const colorSchemes = {
      default:
        "bg-white data-[state=checked]:border-primary data-[state=checked]:bg-white",
      success:
        "bg-white data-[state=checked]:border-green-500 data-[state=checked]:bg-white",
      warning:
        "bg-white data-[state=checked]:border-amber-500 data-[state=checked]:bg-white",
      error:
        "bg-white data-[state=checked]:border-red-500 data-[state=checked]:bg-white",
      purple:
        "bg-white data-[state=checked]:border-purple-500 data-[state=checked]:bg-white",
      blue: "bg-white data-[state=checked]:border-blue-500 data-[state=checked]:bg-white",
    };

    const handleCheckedChange = (checked: boolean | "indeterminate") => {
      if (showRipple) {
        setRippleTrigger((prev) => !prev);
      }
      props.onCheckedChange?.(checked);
    };

    return (
      <div className="group flex items-start gap-3">
        <div className="relative">
          <CheckboxPrimitive.Root
            ref={ref}
            id={checkboxId}
            data-slot="checkbox"
            className={cn(
              "peer shrink-0 rounded-[6px] border border-gray-300 shadow-sm transition-all duration-200",
              "hover:border-primary hover:shadow-md focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
              "transform hover:scale-105 active:scale-95",
              sizeClasses[size],
              colorSchemes[colorScheme],
              className
            )}
            onCheckedChange={handleCheckedChange}
            {...props}
          >
            <CheckboxPrimitive.Indicator
              data-slot="checkbox-indicator"
              className="flex items-center justify-center text-current"
            >
              <AnimatedCheckIcon
                variant={variant}
                colorScheme={colorScheme}
                size={size}
              />
            </CheckboxPrimitive.Indicator>
            {showRipple && <RippleEffect trigger={rippleTrigger} />}
          </CheckboxPrimitive.Root>
        </div>
        <div className="flex flex-col gap-1">
          <Label
            htmlFor={checkboxId}
            className="cursor-pointer text-sm font-medium transition-colors hover:text-primary"
          >
            {label}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

CheckboxRefined.displayName = "CheckboxRefined";

export { CheckboxRefined };

export function CheckboxRefinedShowcase() {
  const [controlled, setControlled] = React.useState(false);
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-5 text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 space-y-16 md:space-y-32">
        {/* Interactive Animation Demo */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <p className="text-slate-400 text-sm md:text-base">
                Choose your preferred interaction style
              </p>
            </div>
            <div className="grid gap-4 md:gap-8">
              <div className="group p-4 md:p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                  <div>
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-white`}>
                      Default Animation
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400">
                      Clean and professional
                    </p>
                  </div>
                  <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors`}>
                    <div className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} bg-blue-400 rounded opacity-70`} />
                  </div>
                </div>
                <CheckboxRefined
                  label="Enable default animations"
                  variant="default"
                  colorScheme="blue"
                  size={isMobile ? "sm" : "md"}
                  description="Crisp and immediate visual feedback"
                />
              </div>

              <div className="group p-4 md:p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                  <div>
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-white`}>
                      Smooth Animation
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400">Fluid and elegant</p>
                  </div>
                  <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors`}>
                    <div className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} bg-purple-400 rounded opacity-70`} />
                  </div>
                </div>
                <CheckboxRefined
                  label="Enable smooth animations"
                  variant="smooth"
                  colorScheme="purple"
                  size={isMobile ? "sm" : "md"}
                  description="Graceful transitions with organic motion"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-black/20 backdrop-blur-xl rounded-3xl p-6 md:p-12 border border-white/10">
              <div className="text-center space-y-6 md:space-y-8">
                <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-light text-white`}>Live Preview</h3>
                <div className="grid grid-cols-3 gap-4 md:gap-8">
                  <div className="text-center space-y-4">
                    <div className="text-xs md:text-sm text-slate-400">Small</div>
                    <CheckboxRefined
                      label="SM"
                      size="sm"
                      variant="smooth"
                      colorScheme="success"
                    />
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-xs md:text-sm text-slate-400">Medium</div>
                    <CheckboxRefined
                      label="MD"
                      size="md"
                      variant="smooth"
                      colorScheme="blue"
                    />
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-xs md:text-sm text-slate-400">Large</div>
                    <CheckboxRefined
                      label="LG"
                      size={isMobile ? "md" : "lg"}
                      variant="smooth"
                      colorScheme="purple"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette Showcase */}
        <div className="space-y-8 md:space-y-12">
          <div className="text-center space-y-4">
            <p className="text-slate-400 text-sm md:text-lg">
              Semantic colors that speak your design language
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                scheme: "default",
                label: "Default",
                color: "from-blue-500 to-blue-600",
                bg: "bg-blue-500/10",
              },
              {
                scheme: "success",
                label: "Success",
                color: "from-emerald-500 to-emerald-600",
                bg: "bg-emerald-500/10",
              },
              {
                scheme: "warning",
                label: "Warning",
                color: "from-amber-500 to-amber-600",
                bg: "bg-amber-500/10",
              },
              {
                scheme: "error",
                label: "Error",
                color: "from-red-500 to-red-600",
                bg: "bg-red-500/10",
              },
              {
                scheme: "purple",
                label: "Purple",
                color: "from-purple-500 to-purple-600",
                bg: "bg-purple-500/10",
              },
              {
                scheme: "blue",
                label: "Blue",
                color: "from-sky-500 to-sky-600",
                bg: "bg-sky-500/10",
              },
            ].map((item) => (
              <div
                key={item.scheme}
                className={`group p-3 md:p-6 ${item.bg} backdrop-blur-xl rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300`}
              >
                <div className="space-y-3 md:space-y-4">
                  <div
                    className={`h-2 md:h-3 bg-gradient-to-r ${item.color} rounded-full`}
                  />
                  <CheckboxRefined
                    label={`${item.label} State`}
                    variant="smooth"
                    size={isMobile ? "sm" : "md"}
                    colorScheme={
                      item.scheme as
                        | "default"
                        | "success"
                        | "warning"
                        | "error"
                        | "purple"
                        | "blue"
                    }
                    defaultChecked
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Features */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
          <div className="space-y-6 md:space-y-8">
            <div>
              <p className="text-slate-400 text-sm md:text-base">
                Advanced interaction patterns for modern interfaces
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="p-4 md:p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-white font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>Ripple Effects</span>
                  <div className={`px-2 md:px-3 py-1 bg-blue-500/20 text-blue-300 ${isMobile ? 'text-xs' : 'text-xs'} rounded-full`}>
                    Enhanced
                  </div>
                </div>
                <CheckboxRefined
                  label="Enable ripple animations"
                  variant="smooth"
                  colorScheme="blue"
                  size={isMobile ? "sm" : "md"}
                  showRipple={true}
                />
              </div>

              <div className="p-4 md:p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-white font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Clean Interaction
                  </span>
                  <div className={`px-2 md:px-3 py-1 bg-slate-500/20 text-slate-300 ${isMobile ? 'text-xs' : 'text-xs'} rounded-full`}>
                    Minimal
                  </div>
                </div>
                <CheckboxRefined
                  label="Disable ripple effects"
                  variant="smooth"
                  colorScheme="purple"
                  size={isMobile ? "sm" : "md"}
                  showRipple={false}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div>
              <p className="text-slate-400 text-sm md:text-base">
                Programmatic control with external state management
              </p>
            </div>

            <div className="p-4 md:p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="text-center space-y-4 md:space-y-6">
                <div className="p-4 md:p-6 bg-black/20 rounded-xl">
                  <CheckboxRefined
                    label="Externally controlled checkbox"
                    variant="smooth"
                    colorScheme="success"
                    size={isMobile ? "sm" : "md"}
                    checked={controlled}
                    onCheckedChange={(checked) =>
                      setControlled(checked === true)
                    }
                    description="State managed by external controls"
                  />
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
                  <button
                    onClick={() => setControlled(true)}
                    className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-emerald-500/25 hover:scale-105`}
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => setControlled(false)}
                    className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 font-medium shadow-lg hover:shadow-slate-500/25 hover:scale-105`}
                  >
                    Deactivate
                  </button>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-black/30 rounded-full">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        controlled ? "bg-emerald-400" : "bg-slate-400"
                      } transition-colors`}
                    />
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-300`}>
                      State:{" "}
                      <span className="font-mono text-white">
                        {String(controlled)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckboxRefinedTheme() {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-8 md:space-y-12">
      <div className="text-center space-y-4">
        <p className="text-slate-400 text-sm md:text-lg">
          Semantic colors that speak your design language
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {[
          {
            scheme: "default",
            label: "Default",
            color: "from-blue-500 to-blue-600",
            bg: "bg-blue-500/10",
          },
          {
            scheme: "success",
            label: "Success",
            color: "from-emerald-500 to-emerald-600",
            bg: "bg-emerald-500/10",
          },
          {
            scheme: "warning",
            label: "Warning",
            color: "from-amber-500 to-amber-600",
            bg: "bg-amber-500/10",
          },
          {
            scheme: "error",
            label: "Error",
            color: "from-red-500 to-red-600",
            bg: "bg-red-500/10",
          },
          {
            scheme: "purple",
            label: "Purple",
            color: "from-purple-500 to-purple-600",
            bg: "bg-purple-500/10",
          },
          {
            scheme: "blue",
            label: "Blue",
            color: "from-sky-500 to-sky-600",
            bg: "bg-sky-500/10",
          },
        ].map((item) => (
          <div
            key={item.scheme}
            className={`group p-3 md:p-6 ${item.bg} backdrop-blur-xl rounded-2xl border border-white/10 hover:scale-105 transition-all duration-300`}
          >
            <div className="space-y-3 md:space-y-4">
              <div
                className={`h-2 md:h-3 bg-gradient-to-r ${item.color} rounded-full`}
              />
              <CheckboxRefined
                label={`${item.label} State`}
                variant="smooth"
                size={isMobile ? "sm" : "md"}
                colorScheme={
                  item.scheme as
                    | "default"
                    | "success"
                    | "warning"
                    | "error"
                    | "purple"
                    | "blue"
                }
                defaultChecked
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
