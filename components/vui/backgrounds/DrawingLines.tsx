"use client"

import { useEffect, useState } from "react"

export default function DrawingLinesShowcase() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Horizontal lines animating from left and right */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-gray-600 opacity-40"
            style={{
              top: `${i * 40}px`,
              left: 0,
              right: 0,
              transformOrigin: i % 2 === 0 ? "left" : "right",
              transform: isVisible ? "scaleX(1)" : "scaleX(0)",
              transition: `transform ${1.8 + Math.sin(i * 0.1) * 0.3}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.04 + Math.random() * 0.02}s`,
            }}
          />
        ))}
      </div>

      {/* Vertical lines animating from top and bottom */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-gray-600 opacity-40"
            style={{
              left: `${i * 40}px`,
              top: 0,
              bottom: 0,
              transformOrigin: i % 2 === 0 ? "top" : "bottom",
              transform: isVisible ? "scaleY(1)" : "scaleY(0)",
              transition: `transform ${1.6 + Math.sin(i * 0.15) * 0.4}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.025 + Math.random() * 0.015}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6">
        <div
          className={`text-center transition-all duration-1000 delay-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-sans">Grid Generation</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
            Watch as each line draws itself into existence, creating a living grid that emerges from multiple directions
            in perfect harmony.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200">
              Get Started
            </button>
            <button className="px-8 py-3 border border-gray-600 text-white font-medium rounded-lg hover:border-gray-400 transition-colors duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
