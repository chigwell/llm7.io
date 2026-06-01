"use client";

import { Button } from "@/components/ui/buttonShadcn";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle, Layers, Zap, BotMessageSquare, Server } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Pill } from "@/components/ui/pill";
import { CountUp } from "@/components/vui/text/CountUp";
import { getDynamicStats } from "@/lib/ComponentCounter";
import { version as vuiVersion } from "@/lib/version";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    VANTA: {
      WAVES: (config: {
        el: HTMLElement;
        mouseControls?: boolean;
        touchControls?: boolean;
        gyroControls?: boolean;
        minHeight?: number;
        minWidth?: number;
        scale?: number;
        scaleMobile?: number;
        color?: number;
        backgroundColor?: number;
        shininess?: number;
        waveHeight?: number;
        waveSpeed?: number;
        zoom?: number;
        forceAnimate?: boolean;
      }) => {
        destroy: () => void;
      };
    };
    THREE: object;
  }
}

export default function HeroSectionWithWaves() {
  const [isMobile, setIsMobile] = useState(false);
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);
  const [vantaLoaded, setVantaLoaded] = useState(false);
  const [vantaLoading, setVantaLoading] = useState(true);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [countVisitors, setCountVisitors] = useState(44);
  const [requestCount, setRequestCount] = useState(211);

  // Fetch dynamic stats on mount
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("https://api.llm7.io/v1/unique-visitors");
        const data = await response.json();
        if (data && data.unique_visitors_last_30_days) {
          const visitors = Math.round(data.unique_visitors_last_30_days / 1000);
          setCountVisitors(visitors);
        }
      } catch (error) {
        console.warn("Failed to fetch visitor stats:", error);
      }

      try {
        const response = await fetch("https://api.llm7.io/stats/counts");
        const data = await response.json();
        if (data && data.total_requests) {
          // Convert to millions and round to nearest integer
          const requestsInMillions = Math.round(data.total_requests / 1000000);
          setRequestCount(requestsInMillions);
        }
      } catch (error) {
        console.warn("Failed to fetch request stats:", error);
        // Keep the default value of 156m+ if there's an error
      }
    }
    fetchStats();
  }, [setCountVisitors, setRequestCount]);

  // Get the current theme, defaulting to system theme if not explicitly set
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkTheme = currentTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const loadVanta = async () => {
      if (
        typeof window !== "undefined" &&
        vantaRef.current &&
        !vantaEffect.current &&
        mounted
      ) {
        setVantaLoading(true);
        try {
          // Load Three.js
          if (!window.THREE) {
            const script1 = document.createElement("script");
            script1.src =
              "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
            document.head.appendChild(script1);

            await new Promise((resolve, reject) => {
              script1.onload = resolve;
              script1.onerror = reject;
              setTimeout(reject, 5000); // 5 second timeout
            });
          }

          // Load Vanta Waves
          if (!window.VANTA) {
            const script2 = document.createElement("script");
            script2.src =
              "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js";
            document.head.appendChild(script2);

            await new Promise((resolve, reject) => {
              script2.onload = resolve;
              script2.onerror = reject;
              setTimeout(reject, 5000); // 5 second timeout
            });
          }

          // Initialize Vanta effect with theme-based colors
          if (window.VANTA && window.THREE && vantaRef.current) {
            // Theme-based color configuration
            const colorConfig = isDarkTheme
              ? {
                  // Dark theme colors (current)
                  color: 0x3a1d88, // Deep purple
                  backgroundColor: 0x18a0dd, // Bright muted blue
                  shininess: isMobile ? 25.0 : 30.0,
                }
              : {
                  color: 0xe0e0e0, // Very light grey, almost white, for the logo's main visible elements
                  backgroundColor: 0xffffff, // Pure white (or fully transparent if handled by CSS/canvas alpha)
                  shininess: isMobile ? 35.0 : 40.0,
                };

            vantaEffect.current = window.VANTA.WAVES({
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: isMobile ? 0.8 : 1.0,
              scaleMobile: 0.8,
              ...colorConfig,
              waveHeight: isMobile ? 15.0 : 20.0,
              waveSpeed: isMobile ? 0.8 : 1.0,
              zoom: isMobile ? 1.0 : 0.9,
              forceAnimate: true,
            });
            setVantaLoaded(true);
          }
        } catch (error) {
          console.warn("Vanta.js failed to load:", error);
          setVantaLoaded(false);
        } finally {
          setVantaLoading(false);
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(loadVanta, 100);

    return () => {
      clearTimeout(timer);
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (error) {
          console.warn("Error destroying Vanta effect:", error);
        }
        vantaEffect.current = null;
      }
    };
  }, [isMobile, isDarkTheme, mounted]);

  // Reinitialize Vanta effect when theme changes
  useEffect(() => {
    if (vantaEffect.current && mounted) {
      // Destroy current effect
      try {
        vantaEffect.current.destroy();
      } catch (error) {
        console.warn("Error destroying Vanta effect:", error);
      }
      vantaEffect.current = null;
      setVantaLoaded(false);
      setVantaLoading(true);

      // The effect will be recreated in the next useEffect cycle
    }
  }, [isDarkTheme, mounted]);

  // Theme-based fallback background
  const fallbackBackground = isDarkTheme
    ? "bg-gradient-to-br from-slate-900 to-slate-800"
    : "bg-gradient-to-br from-white to-gray-100";

  // Theme-based loading indicator color
  const loadingIndicatorColor = isDarkTheme
    ? "border-white"
    : "border-gray-800";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 md:-mt-20">
      {/* Fallback background - theme dependent */}
      <div className={`absolute inset-0 ${fallbackBackground} z-0`}></div>

      {/* Vanta.js container */}
      <div
        ref={vantaRef}
        className="absolute inset-0 z-10"
        style={{
          width: "100%",
          height: "100%",
        }}
      ></div>

      {/* Loading indicator */}
      {vantaLoading && !vantaLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            className={`${
              isMobile ? "w-6 h-6" : "w-8 h-8"
            } border-2 ${loadingIndicatorColor} border-t-transparent rounded-full animate-spin`}
          ></div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pt-40 md:pt-40">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <div className="space-y-6 md:space-y-8 mb-8 md:mb-12">
            <Pill
              icon={<Sparkles className="w-3 h-3 md:w-4 md:h-4" />}
              status="active"
              className="mb-6 md:mb-8 bg-background/50 backdrop-blur-sm text-xs md:text-sm text-muted-foreground"
            >
              {`LLM7.io: models operational`}
            </Pill>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] px-2">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                One LLM API
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                  Your Gateway to AI Innovation
                </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4" style={{marginBottom: '0'}}>
              Connect to leading AI models with one endpoint.
              <span className="text-foreground font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text">

              </span>{" "}
              <span className="text-foreground font-semibold bg-gradient-to-r from-secondary to-primary bg-clip-text">

              </span>
              {" "}
              <span className="text-foreground font-semibold bg-gradient-to-r from-secondary to-primary bg-clip-text">

              </span>
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
Prototype, build, and scale without switching providers.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 max-w-4xl mx-auto px-4">
            <div className="p-4 md:p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
              <Layers className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3 md:mb-4" />
              <h3 className="font-semibold mb-2 text-sm md:text-base">
                Model Flexibility
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Switch seamlessly between leading LLMs with a single API — same calls, same SDKs.

              </p>
            </div>
            <div className="p-4 md:p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3 md:mb-4" />
              <h3 className="font-semibold mb-2 text-sm md:text-base">
                Predictable Performance

              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Consistent low-latency inference and throughput controls for reliable production deployments.

              </p>
            </div>
            <div className="p-4 md:p-6 rounded-2xl border bg-card/50 backdrop-blur-sm sm:col-span-2 md:col-span-1">
              <BotMessageSquare className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3 md:mb-4" />
              <h3 className="font-semibold mb-2 text-sm md:text-base">
                LLM7 Telegram Agent*
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Full-control Telegram automation that can interact on your behalf.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                * (Coming soon)
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-12 md:mb-20 px-4">
            <Button
              size="lg"
              className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold"
              asChild
            >
              <Link href="https://token.llm7.io/">
                Get a Free API Key
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold backdrop-blur-sm"
              asChild
            >
              <Link href="#example">
                Example
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-16 text-center px-4">
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text">
                  <CountUp
                    to={requestCount}
                    suffix="m+"
                    duration={2.5}
                    delay={0.5}
                    effect="elastic"
                    hoverEffect
                  />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  API Calls
                </div>
              </div>
              <div className="w-px h-8 md:h-12 bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-secondary to-primary bg-clip-text">
                    <CountUp
                      to={87}
                      suffix="B+"
                      duration={3}
                      delay={1}
                      effect="bounce"
                      colorTransition
                      hoverEffect
                    />
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Tokens processed
                  </div>
                </div>
              <div className="w-px h-8 md:h-12 bg-gradient-to-b from-transparent via-border to-transparent"></div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-secondary to-primary bg-clip-text">
                  <CountUp
                    to={16}
                      suffix="k+"
                      prefix="$"
                    duration={3}
                    delay={1}
                    effect="bounce"
                    colorTransition
                    hoverEffect
                  />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  User savings
                </div>
              </div>
              <div className="w-px h-8 md:h-12 bg-gradient-to-b from-transparent via-border to-transparent"></div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-secondary to-primary bg-clip-text">
                  <CountUp
                    to={countVisitors}
                    suffix="k+"
                    duration={3}
                    delay={1}
                    effect="bounce"
                    colorTransition
                    hoverEffect
                  />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Visitors (30d)
                </div>
              </div>
              <div className="w-px h-8 md:h-12 bg-gradient-to-b from-transparent via-border to-transparent"></div>
              <div className="hidden lg:inline">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text">
                  <CountUp
                    to={999}
                    format="compact"
                    duration={2}
                    delay={1.5}
                    hoverEffect
                    renderValue={() => (
                      <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                        ∞
                      </span>
                    )}
                  />
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Possibilities
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
