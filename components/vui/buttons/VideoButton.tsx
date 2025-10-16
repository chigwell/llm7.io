"use client";

import { useRef } from "react";

export default function Component() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={() => console.log("Button clicked!")}
        className="relative overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 group"
        style={{ width: "320px", height: "180px" }}
      >
        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Content Overlay */}
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="px-8 py-4 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 transition-all duration-300 group-hover:scale-125 group-hover:bg-white/30">
            <span className="text-2xl font-bold tracking-wide uppercase">
              Use Me
            </span>
          </div>
        </div>

        {/* Animated Border */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
          style={{ padding: "2px" }}
        >
          <div className="w-full h-full bg-transparent rounded-2xl" />
        </div>
      </button>
    </div>
  );
}
