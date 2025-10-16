"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import type React from "react"

export default function MagicalCaret() {
  const [text, setText] = useState("Let's make")
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [caretPosition, setCaretPosition] = useState(0)
  const [caretHeight, setCaretHeight] = useState(72)
  const [hasStartedTyping, setHasStartedTyping] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track mouse for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Enhanced caret positioning with sub-pixel precision
  const updateCaretPosition = useCallback(() => {
    if (!measureRef.current || !inputRef.current || hasStartedTyping) return

    const input = inputRef.current
    const measure = measureRef.current

    const cursorPos = input.selectionStart || 0
    const textBeforeCaret = text.substring(0, cursorPos)

    measure.textContent = textBeforeCaret
    const rect = measure.getBoundingClientRect()
    const textWidth = rect.width

    const computedStyle = window.getComputedStyle(input)
    const fontSize = Number.parseFloat(computedStyle.fontSize)
    const newCaretHeight = fontSize * 1.2

    setCaretPosition(textWidth)
    setCaretHeight(newCaretHeight)
  }, [text, hasStartedTyping])

  // Event handling
  useEffect(() => {
    const input = inputRef.current
    if (!input || hasStartedTyping) return

    const events = [
      "keyup",
      "keydown",
      "click",
      "focus",
      "blur",
      "select",
      "selectstart",
      "selectionchange",
      "mouseup",
      "touchend",
    ]

    const handleUpdate = () => {
      requestAnimationFrame(() => {
        updateCaretPosition()
      })
    }

    events.forEach((event) => {
      input.addEventListener(event, handleUpdate)
    })

    document.addEventListener("selectionchange", handleUpdate)

    return () => {
      events.forEach((event) => {
        input.removeEventListener(event, handleUpdate)
      })
      document.removeEventListener("selectionchange", handleUpdate)
    }
  }, [updateCaretPosition, hasStartedTyping])

  useEffect(() => {
    if (!hasStartedTyping) {
      updateCaretPosition()
    }
  }, [text, updateCaretPosition, hasStartedTyping])

  useEffect(() => {
    // Auto-focus on mount to show demo
    if (inputRef.current && !hasStartedTyping) {
      const input = inputRef.current
      input.focus()
      
      // Simulate a random key press to trigger positioning
      setTimeout(() => {
        // Create a synthetic keyboard event to trigger positioning
        const randomKeys = ['ArrowRight', 'End', 'Home', 'ArrowLeft']
        const randomKey = randomKeys[Math.floor(Math.random() * randomKeys.length)]
        
        // Simulate key press event
        const keyEvent = new KeyboardEvent('keydown', {
          key: randomKey,
          code: randomKey,
          bubbles: true,
          cancelable: true
        })
        
        input.dispatchEvent(keyEvent)
        
        // Also simulate keyup to complete the cycle
        const keyUpEvent = new KeyboardEvent('keyup', {
          key: randomKey,
          code: randomKey,
          bubbles: true,
          cancelable: true
        })
        
        input.dispatchEvent(keyUpEvent)
        
        // Ensure cursor is at end of text after simulation
        setTimeout(() => {
          input.setSelectionRange(text.length, text.length)
          updateCaretPosition()
        }, 10)
      }, 100)
    }
  }, [hasStartedTyping, text, updateCaretPosition])

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasStartedTyping) {
      setHasStartedTyping(true)
    }
    setText(e.target.value)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleReset = () => {
    setText("Let's make")
    setHasStartedTyping(false)
    setIsFocused(false)
    // Focus the input to show the demo effect
    setTimeout(() => {
      if (inputRef.current) {
        const input = inputRef.current
        input.focus()
        setIsFocused(true)
        
        // Simulate random key press after reset
        setTimeout(() => {
          const randomKeys = ['ArrowRight', 'End', 'Home', 'ArrowLeft']
          const randomKey = randomKeys[Math.floor(Math.random() * randomKeys.length)]
          
          const keyEvent = new KeyboardEvent('keydown', {
            key: randomKey,
            code: randomKey,
            bubbles: true,
            cancelable: true
          })
          
          input.dispatchEvent(keyEvent)
          
          const keyUpEvent = new KeyboardEvent('keyup', {
            key: randomKey,
            code: randomKey,
            bubbles: true,
            cancelable: true
          })
          
          input.dispatchEvent(keyUpEvent)
          
          // Ensure proper positioning
          setTimeout(() => {
            input.setSelectionRange("Let's make".length, "Let's make".length)
            updateCaretPosition()
          }, 10)
        }, 50)
      }
    }, 100)
  }

  // Calculate dynamic effects
  const glowIntensity = isFocused ? 1 : isHovered ? 0.7 : 0.4

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background with gradient mesh */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x * 0.1}% ${mousePosition.y * 0.1}%, 
              rgba(99, 102, 241, 0.1) 0%, 
              transparent 50%),
            radial-gradient(circle at ${100 - mousePosition.x * 0.05}% ${100 - mousePosition.y * 0.05}%, 
              rgba(168, 85, 247, 0.08) 0%, 
              transparent 50%),
            linear-gradient(135deg, 
              #0f172a 0%, 
              #1e293b 25%, 
              #334155 50%, 
              #1e293b 75%, 
              #0f172a 100%)
          `,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Main text area with premium styling */}
        <div className="w-full max-w-6xl mb-16">
          <div
            ref={containerRef}
            className="relative group transition-all duration-500 ease-out"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Backdrop with advanced glassmorphism */}
            <div
              className="absolute inset-0 rounded-3xl transition-all duration-500"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, ${0.05 + (isFocused ? 0.05 : 0)}) 0%,
                    rgba(255, 255, 255, ${0.02 + (isFocused ? 0.03 : 0)}) 100%)
                `,
                backdropFilter: `blur(${20 + (isFocused ? 10 : 0)}px)`,
                border: `1px solid rgba(255, 255, 255, ${0.1 + (isFocused ? 0.1 : 0)})`,
                boxShadow: `
                  0 0 0 1px rgba(255, 255, 255, ${0.05 + (isFocused ? 0.1 : 0)}),
                  0 ${isFocused ? 40 : 20}px ${isFocused ? 80 : 40}px -10px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
                transform: `scale(${isFocused ? 1.02 : isHovered ? 1.01 : 1}) 
                           translateY(${isFocused ? -2 : 0}px)`,
              }}
            />

            {/* Content container */}
            <div className="relative p-16 cursor-text">
              {/* Hidden measuring span */}
              {!hasStartedTyping && (
                <span
                  ref={measureRef}
                  className="absolute invisible whitespace-pre text-6xl md:text-7xl font-extralight pointer-events-none"
                  style={{
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    left: "64px",
                    top: "64px",
                    lineHeight: "1.1",
                    letterSpacing: "-0.02em",
                  }}
                />
              )}

              {/* Premium input field */}
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full bg-transparent text-6xl md:text-7xl font-extralight text-white placeholder-slate-400/60 focus:outline-none border-none relative z-20 transition-all duration-300"
                placeholder="Let's make a miracle"
                style={{
                  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  caretColor: hasStartedTyping ? "#ffffff" : "transparent",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                  textShadow: isFocused ? "0 0 30px rgba(255, 255, 255, 0.3)" : "none",
                }}
                autoComplete="off"
                spellCheck="false"
              />

              {/* Ultra-premium cursor animation - FIXED */}
              {!hasStartedTyping && isFocused && (
                <div
                  className="absolute pointer-events-none z-30 transition-all duration-200 ease-out"
                  style={{
                    left: `${caretPosition + 64}px`,
                    top: "64px",
                    height: `${caretHeight}px`,
                  }}
                >
                  {/* Main caret with enhanced glow */}
                  <div
                    className="relative z-50 animate-caret-blink"
                    style={{
                      width: "3px",
                      height: `${caretHeight}px`,
                      background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                      borderRadius: "2px",
                      boxShadow: `
                        0 0 4px rgba(255, 255, 255, 0.9),
                        0 0 8px rgba(255, 255, 255, 0.6),
                        0 0 16px rgba(255, 255, 255, 0.3)
                      `,
                    }}
                  />

                  {/* Primary light burst */}
                  <div
                    className="absolute top-0 left-0 pointer-events-none z-25 animate-caret-blink"
                    style={{
                      width: "600px",
                      height: `${caretHeight * 2.5}px`,
                      top: `${-caretHeight * 0.75}px`,
                      left: "-2px",
                      background: `
                        radial-gradient(ellipse 90% 70% at 0% 50%, 
                          rgba(255, 235, 200, ${0.8 * glowIntensity}) 0%,
                          rgba(255, 220, 180, ${0.6 * glowIntensity}) 10%,
                          rgba(255, 200, 150, ${0.4 * glowIntensity}) 25%,
                          rgba(255, 180, 120, ${0.25 * glowIntensity}) 40%,
                          rgba(255, 160, 100, ${0.15 * glowIntensity}) 55%,
                          rgba(255, 140, 80, ${0.08 * glowIntensity}) 70%,
                          rgba(255, 120, 60, ${0.04 * glowIntensity}) 85%,
                          transparent 100%
                        )
                      `,
                      filter: "blur(1px)",
                    }}
                  />

                  {/* Secondary atmospheric glow */}
                  <div
                    className="absolute top-0 left-0 pointer-events-none z-20 animate-caret-blink"
                    style={{
                      width: "800px",
                      height: `${caretHeight * 3}px`,
                      top: `${-caretHeight}px`,
                      left: "-2px",
                      background: `
                        radial-gradient(ellipse 100% 60% at 0% 50%, 
                          rgba(255, 220, 180, ${0.5 * glowIntensity}) 0%,
                          rgba(255, 200, 150, ${0.3 * glowIntensity}) 15%,
                          rgba(255, 180, 120, ${0.2 * glowIntensity}) 30%,
                          rgba(255, 160, 100, ${0.12 * glowIntensity}) 45%,
                          rgba(255, 140, 80, ${0.06 * glowIntensity}) 60%,
                          rgba(255, 120, 60, ${0.03 * glowIntensity}) 75%,
                          transparent 90%
                        )
                      `,
                      filter: "blur(3px)",
                    }}
                  />
                </div>
              )}

              {/* Continuation text with FIXED spacing */}
              {text === "Let's make" && !hasStartedTyping && (
                <div
                  className="absolute pointer-events-none text-6xl md:text-7xl font-extralight transition-all duration-300"
                  style={{
                    left: `${caretPosition + 64 + 20}px`, // Added proper spacing
                    top: "64px",
                    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    color: `rgba(156, 163, 175, ${0.6 + glowIntensity * 0.3})`,
                    lineHeight: "1.1",
                    letterSpacing: "-0.02em",
                    textShadow: `0 0 20px rgba(255, 180, 120, ${0.2 * glowIntensity})`,
                  }}
                >
                  a miracle
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced search bar */}
        <div className="w-full max-w-3xl mb-12">
          <div className="relative group">
            <div
              className="absolute inset-0 rounded-2xl transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            />
            <div className="relative flex items-center gap-6 p-6">
              {/* Avatar with glow */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-500"></div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-sm"></div>
              </div>

              {/* Link icon */}
              <div className="w-10 h-10 rounded-xl bg-slate-700/50 backdrop-blur-sm flex items-center justify-center border border-slate-600/30">
                <div className="w-5 h-5 border-2 border-slate-400 rounded transform rotate-45"></div>
              </div>

              {/* Search section */}
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-7 h-7 rounded-full border-2 border-slate-400/60"></div>
                <span className="text-xl font-light">Search</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status indicator with reset button */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  hasStartedTyping
                    ? "bg-green-400 shadow-lg shadow-green-400/50"
                    : "bg-amber-400 shadow-lg shadow-amber-400/50 animate-pulse"
                }`}
              />
              <span className="text-slate-300 text-sm font-medium">
                {hasStartedTyping ? "Normal typing mode" : "Demo mode active"}
              </span>
            </div>

            {/* Reset button */}
            {hasStartedTyping && (
              <button
                onClick={handleReset}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 text-sm font-medium transition-all duration-300 hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-400/50 hover:text-blue-200 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="relative z-10">Reset to Demo</span>
              </button>
            )}
          </div>

          <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
            {hasStartedTyping
              ? "You're now in standard input mode - click reset to see the premium cursor animation again"
              : "Experience the premium cursor animation - start typing to switch to normal mode"}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes caret-blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
        
        .animate-caret-blink {
          animation: caret-blink 1s infinite;
        }
      `}</style>
    </div>
  )
}
