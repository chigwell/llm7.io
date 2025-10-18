"use client";

import Link from "next/link";

export default function BeautifulFooterShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-fuchsia-500 to-slate-900 relative overflow-hidden">
      {/* Amplified artistic overlay gradients for maximum depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-purple-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-amber-300/30 via-transparent to-purple-900/40 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/25 via-transparent to-cyan-400/15 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-600/15 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-radial from-amber-400/20 via-transparent to-transparent pointer-events-none"></div>

      {/* Glaring light effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-radial from-pink-400/30 via-pink-400/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-radial from-amber-300/25 via-amber-300/8 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-radial from-violet-500/20 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-radial from-cyan-400/15 via-cyan-400/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Additional glamour layers */}
      <div className="absolute inset-0 bg-gradient-to-tl from-rose-600/20 via-transparent to-indigo-500/20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-500/10 to-purple-800/25 pointer-events-none"></div>

      {/* Artistic noise texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,215,0,0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(236,72,153,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(139,69,19,0.05) 0%, transparent 50%)`,
        }}
      ></div>

      {/* Large clean background text with artistic glow */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none">
        <div
          className="text-[8rem] xs:text-[10rem] sm:text-[15rem] md:text-[20rem] lg:text-[25rem] xl:text-[30rem] font-black select-none leading-none tracking-tight"
          style={{
            transform: "translateY(15%)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,215,0,0.1) 30%, rgba(255,255,255,0.08) 70%, rgba(236,72,153,0.12) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter:
              "drop-shadow(0 0 80px rgba(255,215,0,0.3)) drop-shadow(0 0 120px rgba(236,72,153,0.2))",
          }}
        >
          vyoma 
        </div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col min-h-screen p-10 sm:p-8 md:p-12">
        {/* Header */}
        <header className="flex justify-between items-start mb-8 sm:mb-12">
          <div
            className="text-xl sm:text-2xl font-light tracking-wide"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 0 20px rgba(255,215,0,0.4))",
            }}
                      >
            vyoma ui
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 flex flex-col justify-between">
          {/* Hero section - aligned text block */}
          <section className="flex justify-end mb-8 sm:mb-16">
            <div className="max-w-sm sm:max-w-lg text-left">
              <Link
                href="#contact"
                className="text-amber-200/90 hover:text-amber-100 transition-all duration-300 text-xs sm:text-sm block mb-3 sm:mb-4 uppercase tracking-wider font-medium"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(255,215,0,0.5))",
                }}
              >
                Contact us
              </Link>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light leading-tight">
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    filter: "drop-shadow(0 0 30px rgba(255,255,255,0.3))",
                  }}
                >
                  Partner with a creative team{" "}
                </span>
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.4) 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  that moves at your speed — and always delivers beyond the
                  brief.
                </span>
              </h1>
            </div>
          </section>

          {/* Middle section - Contact info and navigation on same line */}
          <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-8 mb-8 sm:mb-16">
            {/* Contact info - left side */}
            <address className="order-2 sm:order-1 not-italic">
              <p
                className="text-xs sm:text-sm mb-1 sm:mb-2 uppercase tracking-wider"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,215,0,0.8) 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Have an idea? Say Hi!
              </p>
              <a
                href="mailto:Hi@vyomaui.com"
                className="text-lg sm:text-xl font-light hover:scale-105 transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ffffff 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 0 20px rgba(255,215,0,0.4))",
                }}
              >
                Hi@vyomaui.com
              </a>
            </address>

            {/* Navigation - right side */}
            <nav className="flex flex-wrap gap-4 sm:gap-6 lg:gap-12 order-1 sm:order-2">
              {["Works", "Services", "Process", "Articles"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-lg sm:text-xl font-light hover:scale-105 transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    filter: "drop-shadow(0 0 15px rgba(255,255,255,0.2))",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter =
                      "drop-shadow(0 0 25px rgba(255,215,0,0.6)) drop-shadow(0 0 35px rgba(236,72,153,0.4))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter =
                      "drop-shadow(0 0 15px rgba(255,255,255,0.2))";
                  }}
                >
                  {item}
                </Link>
              ))}
            </nav>
          </section>
        </main>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 text-xs sm:text-sm">
          <p
            className="font-light"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Copyright © 2025 vyoma ui
          </p>
          <nav className="flex gap-4 sm:gap-8">
            <Link
              href="#privacy"
              className="hover:scale-105 transition-all duration-300 font-light"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter =
                  "drop-shadow(0 0 15px rgba(255,215,0,0.5))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "none";
              }}
            >
              Privacy & Policy
            </Link>
            <Link
              href="#terms"
              className="hover:scale-105 transition-all duration-300 font-light"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter =
                  "drop-shadow(0 0 15px rgba(255,215,0,0.5))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "none";
              }}
            >
              Terms & Conditions
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
