"use client";

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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

export default function Background() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);
  const [vantaLoaded, setVantaLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadVanta = async () => {
      if (
        typeof window !== "undefined" &&
        vantaRef.current &&
        !vantaEffect.current
      ) {
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

          // Initialize Vanta effect with consistent mobile-optimized settings
          if (window.VANTA && window.THREE && vantaRef.current) {
            vantaEffect.current = window.VANTA.WAVES({
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: isMobile ? 0.8 : 1.0,
              scaleMobile: 0.8,
              color: 0x1a1a2e, // Consistent color scheme
              backgroundColor: 0x0f0f23, // Consistent background
              shininess: isMobile ? 25.0 : 30.0,
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
  }, [isMobile]);

  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Fallback background - consistent with showcase */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0"></div>

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
      {!vantaLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            className={`${
              isMobile ? "w-6 h-6" : "w-8 h-8"
            } border-2 border-white border-t-transparent rounded-full animate-spin`}
          ></div>
        </div>
      )}

      {/* Content - consistent responsive styling */}
      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div
          className={`${
            isMobile ? "mb-4 space-y-2" : "mb-8 space-y-3 md:space-y-6"
          }`}
        >
          <div className="inline-block">
            <h1
              className={`${
                isMobile ? "text-3xl" : "text-6xl md:text-8xl"
              } font-black tracking-tighter bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-pulse`}
            >
              INTERACTIVE WAVES
            </h1>
            <div
              className={`h-1 w-full bg-gradient-to-r from-transparent via-white to-transparent ${
                isMobile ? "mt-2" : "mt-4"
              } animate-pulse`}
            />
          </div>

          <p
            className={`${
              isMobile
                ? "text-sm px-4 leading-relaxed"
                : "text-lg md:text-xl px-0 leading-relaxed"
            } text-gray-300 max-w-2xl font-light`}
          >
            Experience mesmerizing fluid dynamics with
            <span className="text-white font-medium"> Vanta.js </span>
            powered interactive waves that respond to your {isMobile ? "touch" : "movement"}
          </p>
        </div>
      </div>
    </section>
  );
}

// Showcase Component for WavyTiles
export function WavyTilesShowcase() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);
  const [vantaLoaded, setVantaLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadVanta = async () => {
      if (
        typeof window !== "undefined" &&
        vantaRef.current &&
        !vantaEffect.current
      ) {
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
              setTimeout(reject, 5000);
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
              setTimeout(reject, 5000);
            });
          }

          // Initialize Vanta effect
          if (window.VANTA && window.THREE && vantaRef.current) {
            vantaEffect.current = window.VANTA.WAVES({
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: isMobile ? 0.8 : 1.0,
              scaleMobile: 0.8,
              color: 0x1a1a2e,
              backgroundColor: 0x0f0f23,
              shininess: isMobile ? 25.0 : 30.0,
              waveHeight: isMobile ? 15.0 : 20.0,
              waveSpeed: isMobile ? 0.8 : 1.0,
              zoom: isMobile ? 1.0 : 0.9,
              forceAnimate: true,
            });
            setVantaLoaded(true);
          }
        } catch (error) {
          console.warn(`Vanta.js failed to load: ${error}`);
          setVantaLoaded(false);
        }
      }
    };

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
  }, [isMobile]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-4 md:space-y-6">
        {/* Showcase Container */}
        <div className="relative w-full h-96 rounded-lg overflow-hidden border">
          {/* Fallback background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800"></div>

          {/* Vanta.js container */}
          <div
            ref={vantaRef}
            className="absolute inset-0"
            style={{
              width: "100%",
              height: "100%",
            }}
          ></div>

          {/* Loading indicator */}
          {!vantaLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`${
                  isMobile ? "w-6 h-6" : "w-8 h-8"
                } border-2 border-white border-t-transparent rounded-full animate-spin`}
              ></div>
            </div>
          )}

          {/* Overlay content */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <h2
                className={`${
                  isMobile ? "text-2xl" : "text-4xl"
                } font-bold mb-2 md:mb-4`}
              >
                Interactive Waves
              </h2>
              <p className={`${isMobile ? "text-sm" : "text-lg"} opacity-80`}>
                {isMobile
                  ? "Touch to interact"
                  : "Move your mouse to interact with the waves"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WavyTilesTheme() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);
  const [vantaLoaded, setVantaLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadVanta = async () => {
      if (
        typeof window !== "undefined" &&
        vantaRef.current &&
        !vantaEffect.current
      ) {
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
              setTimeout(reject, 5000);
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
              setTimeout(reject, 5000);
            });
          }

          // Initialize Vanta effect
          if (window.VANTA && window.THREE && vantaRef.current) {
            vantaEffect.current = window.VANTA.WAVES({
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: isMobile ? 0.8 : 1.0,
              scaleMobile: 0.8,
              color: 0x1a1a2e,
              backgroundColor: 0x0f0f23,
              shininess: isMobile ? 25.0 : 30.0,
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
        }
      }
    };

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
  }, [isMobile]);

  return (
    <div className="relative w-full h-96 bg-black overflow-hidden rounded-lg">
      {/* Vanta.js container */}
      <div
        ref={vantaRef}
        className="absolute inset-0"
        style={{
          width: "100%",
          height: "100%",
        }}
      ></div>

      {/* Loading indicator */}
      {!vantaLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${
              isMobile ? "w-6 h-6" : "w-8 h-8"
            } border-2 border-white border-t-transparent rounded-full animate-spin`}
          ></div>
        </div>
      )}

      {/* Overlay content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center text-white">
          <h2
            className={`${
              isMobile ? "text-2xl" : "text-4xl"
            } font-bold mb-2 md:mb-4`}
          >
            Interactive Waves
          </h2>
          <p className={`${isMobile ? "text-sm" : "text-lg"} opacity-80`}>
            {isMobile
              ? "Touch to interact"
              : "Move your mouse to interact with the waves"}
          </p>
        </div>
      </div>
    </div>
  );
}
