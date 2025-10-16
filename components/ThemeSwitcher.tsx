"use client";

import type React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { componentMap, type ComponentEntry } from "@/data/ComponentMapping";


const CARD_CONFIG = {
  height: "h-[45rem]", 
  cols: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2", 
};


function ComponentPreview({
  component: Component,
  name,
  isActive = false,
}: {
  component: React.ComponentType;
  name: string;
  isActive?: boolean;
}) {
  try {
    return (
      <div
        className={`
          relative w-full h-full flex items-center justify-center
          transition-all duration-300 ease-out
          ${isActive ? "scale-[1.01]" : "scale-100"}
          overflow-hidden
        `}
      >
        <div
          className={`relative w-full h-full p-4 ${
            name.toLowerCase() !== "bento grid"
              ? "flex items-center justify-center"
              : ""
          }`}
        >
          <div
            className={`max-w-full max-h-full ${
              name.toLowerCase() !== "bento grid"
                ? "flex items-center justify-center"
                : ""
            }`}
          >
            <Component />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Error rendering ${name}:`, error);
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full mx-auto mb-3" />
          <p className="font-medium text-sm">{name}</p>
          <p className="text-sm opacity-60">Preview</p>
        </div>
      </div>
    );
  }
}

export default function ThemeSwitcher() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const allComponents = Object.entries(componentMap)
    .filter(([category]) => category !== "Get Started")
    .flatMap(([category, components]) =>
      components.map((component: ComponentEntry) => ({
        ...component,
        category,
        id: `${category}-${component.name}`,
      })).filter((component) => component.name !== "Navigation")
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-3">
            VUI Component Gallery
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mb-4 px-4">
            Beautiful, responsive components for modern applications
          </p>
        </div>

        <div className={`grid ${CARD_CONFIG.cols} gap-4 sm:gap-6 lg:gap-8`}>
          {allComponents.map((component, index) => {
            const ComponentToRender = component.theme || component.component;

            return (
              <Card
                key={component.id}
                className={`
                  group relative overflow-hidden
                  ${CARD_CONFIG.height} w-full 
                  border transition-all duration-300 ease-out
                  hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10
                  bg-card/95 backdrop-blur-sm
                  hover:bg-card
                  transform hover:-translate-y-1
                  ${
                    activeCard === index
                      ? "ring-2 ring-primary/20 shadow-lg shadow-primary/10 -translate-y-1"
                      : ""
                  }
                `}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div className="absolute top-3 left-3 z-20">
                  <Badge
                    variant="outline"
                    className="text-xs bg-background/80 backdrop-blur-sm"
                  >
                    {component.category}
                  </Badge>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex-1 relative overflow-hidden">
                  <div className="absolute inset-0 m-3 rounded-lg bg-gradient-to-br from-muted/10 to-muted/5 group-hover:from-muted/20 group-hover:to-muted/10 transition-all duration-300">
                    <ComponentPreview
                      component={ComponentToRender}
                      name={component.name}
                      isActive={activeCard === index}
                    />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card via-card/90 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm sm:text-base text-foreground truncate">
                        {component.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {component.category}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
