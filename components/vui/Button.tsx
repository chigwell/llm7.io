"use client";

import React from "react";
import { FlipButton } from "./buttons/FlipButton";
import MagneticButton from "./buttons/MagneticButton";
import { ShimmerButton } from "./buttons/ShimmerButton";
import { ShinyButton } from "./buttons/ShinyButtons";
import { SpotlightButton } from "./buttons/SpotLight";
import VideoButton from "./buttons/VideoButton";
import { AnimatedOpenInV0Button } from "./buttons/OpenInv0";
import { Button } from "@/components/ui/buttonShadcn";

interface ButtonShowcaseProps {
  className?: string;
}

export function ButtonShowcase({ className }: ButtonShowcaseProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto p-8 space-y-12 ${className}`}>
      {/* Flip Buttons Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Flip Buttons</h2>
          <p className="text-muted-foreground">
            3D flip animations from different directions
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          <div className="flex flex-col items-center space-y-2">
            <FlipButton frontText="Hover me" backText="From Top!" from="top" />
            <span className="text-xs text-muted-foreground">From Top</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <FlipButton
              frontText="Hover me"
              backText="From Bottom!"
              from="bottom"
            />
            <span className="text-xs text-muted-foreground">From Bottom</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <FlipButton
              frontText="Hover me"
              backText="From Left!"
              from="left"
            />
            <span className="text-xs text-muted-foreground">From Left</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <FlipButton
              frontText="Hover me"
              backText="From Right!"
              from="right"
            />
            <span className="text-xs text-muted-foreground">From Right</span>
          </div>
        </div>
      </section>

      {/* Interactive Buttons Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Interactive Buttons</h2>
          <p className="text-muted-foreground">
            Buttons with dynamic hover and magnetic effects
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          <div className="flex flex-col items-center space-y-4">
            <MagneticButton distance={0.6}>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300">
                Magnetic Button
              </Button>
            </MagneticButton>
            <span className="text-xs text-muted-foreground text-center">
              Follows your cursor
            </span>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <SpotlightButton text="Spotlight Effect" />
            <span className="text-xs text-muted-foreground text-center">
              Radial gradient spotlight
            </span>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <AnimatedOpenInV0Button url="https://google.com" />
            <span className="text-xs text-muted-foreground text-center">
              Open in v0 with animation
            </span>
          </div>
        </div>
      </section>

      {/* Shimmer & Shine Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Shimmer & Shine Effects
          </h2>
          <p className="text-muted-foreground">
            Buttons with beautiful light and shimmer animations
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          <div className="flex flex-col items-center space-y-4">
            <ShimmerButton
              shimmerColor="#ffffff"
              background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              className="px-8 py-3 font-semibold"
            >
              Shimmer Button
            </ShimmerButton>
            <span className="text-xs text-muted-foreground text-center">
              Rotating shimmer effect
            </span>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <ShinyButton className="px-8 py-3 bg-gradient-to-r from-pink-500 to-violet-500 border-pink-500/20">
              Shiny Button
            </ShinyButton>
            <span className="text-xs text-muted-foreground text-center">
              Moving shine animation
            </span>
          </div>
        </div>
      </section>

      {/* Special Effects Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Special Effects</h2>
          <p className="text-muted-foreground">
            Unique button designs with video backgrounds and special effects
          </p>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="scale-75 transform">
              <VideoButton />
            </div>
            <span className="text-xs text-muted-foreground text-center">
              Video background button
            </span>
          </div>
        </div>
      </section>

      {/* Color Variations Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Color Variations</h2>
          <p className="text-muted-foreground">
            Different color schemes for the same button types
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          <div className="flex flex-col items-center space-y-2">
            <ShimmerButton
              shimmerColor="#ff6b6b"
              background="linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
              className="px-6 py-2"
            >
              Pink Shimmer
            </ShimmerButton>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <ShimmerButton
              shimmerColor="#4ecdc4"
              background="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
              className="px-6 py-2"
            >
              Teal Shimmer
            </ShimmerButton>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <ShimmerButton
              shimmerColor="#ffd93d"
              background="linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)"
              className="px-6 py-2"
            >
              Gold Shimmer
            </ShimmerButton>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ButtonTheme() {
  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <MagneticButton distance={0.6}>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300">
            Magnetic Button
          </Button>
        </MagneticButton>
        <ShimmerButton
          shimmerColor="#ffd93d"
          background="linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)"
          className="px-6 py-2"
        >
          Gold Shimmer
        </ShimmerButton>
        <AnimatedOpenInV0Button url="https://google.com" />
        <FlipButton frontText="Hover me" backText="From Top!" from="top" />
        <FlipButton
              frontText="Hover me"
              backText="From Bottom!"
              from="bottom"
            />
            <FlipButton frontText="Hover me" backText="From Left!" from="left" />
            <FlipButton frontText="Hover me" backText="From Right!" from="right" />
            <SpotlightButton text="Spotlight Effect" />
      </div>
    </>
  );
}
