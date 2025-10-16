"use client";

import React from "react";
import { Timeline } from "@/components/ui/TimeLine";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Rocket,
  Zap,
  Sparkles,
  Package,
  Palette,
  Smartphone,
  Code,
  Moon,
  Star,
  Gift,
} from "lucide-react";

export default function ChangeLog() {
  const isMobile = useIsMobile();

  const data = [
    {
      title: "July 09, 2025 - v1.0.0 Public Release",
      date: "July 9, 2025",
      icon: <Gift />,
      tag: "Major Release",
      color: "purple",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <p
              className={`${
                isMobile ? "text-sm" : "text-base"
              } font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed`}
            >
              We&apos;re thrilled to announce the public release of{" "}
              <strong>VyomaUI v1.0.0</strong>! Our comprehensive React component
              library is now available to help developers build beautiful,
              modern interfaces with ease. This release includes{" "}
              <strong>40+ carefully crafted components</strong> with TypeScript
              support, dark mode compatibility, and stunning animations.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h4
                className={`${
                  isMobile ? "text-lg" : "text-xl"
                } font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center justify-center gap-2`}
              >
                <Rocket className="w-5 h-5 text-purple-600" />
                Core Components Released
              </h4>
            </div>

            <div
              className={`grid ${
                isMobile
                  ? "grid-cols-1 gap-4"
                  : "grid-cols-1 lg:grid-cols-2 gap-6"
              }`}
            >
              {/* Interactive Buttons */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h5
                    className={`${
                      isMobile ? "text-sm" : "text-base"
                    } font-semibold text-blue-900 dark:text-blue-100`}
                  >
                    Interactive Buttons
                  </h5>
                </div>
                <div
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-blue-800 dark:text-blue-200 space-y-1`}
                >
                  <div>• FlipButton - Smooth flip animations</div>
                  <div>• MagneticButton - Magnetic hover effects</div>
                  <div>• ShimmerButton - Elegant shimmer effects</div>
                  <div>• ShinyButtons - Premium shine animations</div>
                  <div>• SpotLight - Interactive spotlight effects</div>
                </div>
              </div>

              {/* Text Animations */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <h5
                    className={`${
                      isMobile ? "text-sm" : "text-base"
                    } font-semibold text-green-900 dark:text-green-100`}
                  >
                    Text Animations
                  </h5>
                </div>
                <div
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-green-800 dark:text-green-200 space-y-1`}
                >
                  <div>• AnimatedNumber - Smooth number transitions</div>
                  <div>• CountUp - Dynamic counting animations</div>
                  <div>• TextDecryption - Matrix-style text reveals</div>
                  <div>• TypingText - Realistic typing effects</div>
                </div>
              </div>

              {/* Layout Components */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-purple-600" />
                  <h5
                    className={`${
                      isMobile ? "text-sm" : "text-base"
                    } font-semibold text-purple-900 dark:text-purple-100`}
                  >
                    Layout & Structure
                  </h5>
                </div>
                <div
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-purple-800 dark:text-purple-200 space-y-1`}
                >
                  <div>• BentoGrid - Modern grid layouts</div>
                  <div>• Card - Versatile content containers</div>
                  <div>• Sheet - Slide-out panels</div>
                  <div>• Accordion - Collapsible content sections</div>
                  <div>• Navigation - Advanced navigation systems</div>
                </div>
              </div>

              {/* Form Elements */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-4 h-4 text-orange-600" />
                  <h5
                    className={`${
                      isMobile ? "text-sm" : "text-base"
                    } font-semibold text-orange-900 dark:text-orange-100`}
                  >
                    Form & Input
                  </h5>
                </div>
                <div
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-orange-800 dark:text-orange-200 space-y-1`}
                >
                  <div>• CheckboxUpgraded - Enhanced checkboxes</div>
                  <div>• WheelPicker - Smooth wheel selectors</div>
                </div>
              </div>
              {/* Navigation & Utils */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <h5
                    className={`${
                      isMobile ? "text-sm" : "text-base"
                    } font-semibold text-indigo-900 dark:text-indigo-100`}
                  >
                    Navigation & Utils
                  </h5>
                </div>
                <div
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-indigo-800 dark:text-indigo-200 space-y-1`}
                >
                  <div>• ResizeableNavbar - Adaptive navigation</div>
                  <div>• ToolTip - Contextual information</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50">
            <h4
              className={`${
                isMobile ? "text-lg" : "text-xl"
              } font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2`}
            >
              <Star className="w-5 h-5 text-yellow-500" />
              Key Features & Benefits
            </h4>
            <div
              className={`grid ${
                isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"
              } ${isMobile ? "text-sm" : "text-base"}`}
            >
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Code className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Full TypeScript support</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Moon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Complete dark mode compatibility</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Zap className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <span>Optimized performance</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Smartphone className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Fully responsive design</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Palette className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Customizable with Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Package className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>Easy npm/yarn installation</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full overflow-clip">
      <Timeline
        data={data}
        title="VyomaUI Evolution"
        subtitle={
          isMobile
            ? "Building the future of React components"
            : "A journey through remarkable milestones and revolutionary component development"
        }
      />
    </div>
  );
}
