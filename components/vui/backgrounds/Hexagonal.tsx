"use client";

export default function HexagonalShowcase() {
  return (
    <>
      <style jsx>{`
        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: scale(0.95) rotate(0deg);
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0.5deg);
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            filter: brightness(1) hue-rotate(0deg);
          }
          50% {
            filter: brightness(1.2) hue-rotate(10deg);
          }
        }
        
        @keyframes subtleShift {
          0%, 100% {
            background-position: 0px 0px, 0px 0px, 0px 0px;
          }
          50% {
            background-position: 22px 22px, -22px 22px, 11px -11px;
          }
        }
        
        .animated-bg {
          animation: 
            fadeInSlide 3s ease-out forwards,
            pulseGlow 6s ease-in-out infinite 1.5s,
            subtleShift 8s ease-in-out infinite 2s;
        }
      `}</style>
      <div className="min-h-screen w-full bg-[#0f0f0f] relative text-white overflow-hidden">
        <div
          className="absolute inset-0 z-0 pointer-events-none animated-bg opacity-0"
          style={{
            backgroundImage: `
        repeating-linear-gradient(60deg, rgba(255, 0, 100, 0.25) 0, rgba(255, 0, 100, 0.25) 1px, transparent 1px, transparent 22px),
        repeating-linear-gradient(-60deg, rgba(0, 255, 200, 0.2) 0, rgba(0, 255, 200, 0.2) 1px, transparent 1px, transparent 22px),
        repeating-linear-gradient(0deg, rgba(147, 51, 234, 0.15) 0, rgba(147, 51, 234, 0.15) 1px, transparent 1px, transparent 22px)
      `,
            backgroundSize: "44px 44px",
          }}
        />
                 <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center justify-center space-y-6 z-10 relative">
            {/* Animated Main Title */}
            <div className="overflow-hidden">
              <h1 className="text-6xl md:text-8xl font-bold text-white bg-clip-text text-wrap text-center">
                Beautiful Background for Everyone
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
