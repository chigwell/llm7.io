"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { MessageSquare, Grid3x3, CircleDot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/buttonShadcn";

// Data model for featured items
interface FeaturedItem {
  name: string;
  description: string;
  icon: React.ReactElement;
  route: string;
  accent: "purple" | "blue" | "amber";
}

const items: FeaturedItem[] = [
  {
    name: "Magical Chat Input",
    description:
      "AI-powered chat interface with fluid cursor + micro-interactions. Perfect for conversational & assistant UIs.",
    icon: <MessageSquare className="w-8 h-8" />,
    route: "/ai-components/magical-chat-input",
    accent: "purple",
  },
  {
    name: "Bento Grid",
    description:
      "Apple-inspired responsive grid layout with elegant hover depth & adaptive sizing for rich showcases.",
    icon: <Grid3x3 className="w-8 h-8" />,
    route: "/components/bento-grid",
    accent: "blue",
  },
  {
    name: "Wheel Picker",
    description:
      "Physics‑based iOS style wheel for natural selection gestures with momentum & smooth scroll feel.",
    icon: <CircleDot className="w-8 h-8" />,
    route: "/components/wheel-picker",
    accent: "amber",
  },
];

// Accent styling helpers centralised for consistency
const accentClasses: Record<FeaturedItem["accent"], { ring: string; bg: string; glow: string; text: string; grad: string }> = {
  purple: {
    ring: "ring-purple-400/40",
    bg: "from-purple-600/20 to-violet-600/20",
    glow: "shadow-[0_0_0_1px_rgba(147,51,234,0.4)] shadow-purple-600/30",
    text: "text-purple-300",
    grad: "from-purple-500/30 via-violet-500/20 to-purple-600/30",
  },
  blue: {
    ring: "ring-sky-400/40",
    bg: "from-sky-600/20 to-cyan-600/20",
    glow: "shadow-[0_0_0_1px_rgba(2,132,199,0.4)] shadow-cyan-600/30",
    text: "text-sky-300",
    grad: "from-sky-500/30 via-cyan-500/20 to-sky-600/30",
  },
  amber: {
    ring: "ring-amber-400/40",
    bg: "from-amber-600/20 to-orange-600/20",
    glow: "shadow-[0_0_0_1px_rgba(217,119,6,0.4)] shadow-amber-600/30",
    text: "text-amber-300",
    grad: "from-amber-500/30 via-orange-500/20 to-amber-600/30",
  },
};

export default function FeaturedComponents() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="featured-heading"
      className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background via-background to-background/95"
    >
      {/* Ambient background: subtle grid + blurred gradient orbs (very low opacity for uniform dark theme) */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:42px_42px] opacity-10" />
        <motion.div
          className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-purple-600/25 via-violet-700/10 to-transparent blur-3xl opacity-20"
          animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-44 -right-32 w-[560px] h-[560px] rounded-full bg-gradient-to-tr from-sky-600/25 via-cyan-700/10 to-transparent blur-3xl opacity-20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.3, 0.18] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-border/40 backdrop-blur-sm text-xs md:text-sm font-medium"
          >
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Curated Highlights
            </span>
          </motion.div>
          <motion.h2
            id="featured-heading"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Featured Components
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground leading-relaxed"
          >
            Production‑ready, animated, and accessible building blocks to accelerate your UI development.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {items.map((item, i) => {
            const accent = accentClasses[item.accent];
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                onHoverStart={() => setHoverIndex(i)}
                onHoverEnd={() => setHoverIndex(null)}
              >
                <Link
                  href={item.route}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl h-full"
                >
                  <div
                    className={
                      "relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 md:p-7 flex flex-col shadow-lg transition-colors duration-300 hover:border-border/40" +
                      " " + accent.glow
                    }
                  >
                    {/* Localized soft gradient highlight */}
                    <motion.div
                      aria-hidden="true"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoverIndex === i ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                      className={`absolute inset-0 bg-gradient-to-br ${accent.grad}`}>
                    </motion.div>

                    {/* Subtle moving sheen */}
                    <motion.div
                      aria-hidden="true"
                      initial={{ x: "-120%" }}
                      animate={{ x: hoverIndex === i ? "120%" : "-120%" }}
                      transition={{ duration: 1.8, ease: "easeInOut", repeat: hoverIndex === i ? Infinity : 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                    />

                    {/* Icon */}
                    <div
                      className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-5 border border-white/10 bg-gradient-to-br ${accent.bg}`}
                    >
                      <motion.div
                        aria-hidden="true"
                        animate={{
                          scale: hoverIndex === i ? [1, 1.08, 1] : 1,
                          rotate: hoverIndex === i ? [0, -3, 3, -3, 0] : 0,
                        }}
                        transition={{ duration: 1.6, ease: "easeInOut", repeat: hoverIndex === i ? Infinity : 0 }}
                        className="text-white"
                      >
                        {item.icon}
                      </motion.div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-semibold mb-2 tracking-tight">
                      <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-black dark:text-white group-hover:from-primary group-hover:to-secondary transition-colors duration-300">
                        {item.name}
                      </span>
                    </h3>

                    {/* Description */}
                    <p className="text-xs md:text-sm text-muted-foreground/90 leading-relaxed flex-grow">
                      {item.description}
                    </p>

                    {/* CTA */}
                    <div className="mt-5 flex items-center gap-2 text-xs font-medium">
                      <motion.span
                        animate={{ x: hoverIndex === i ? [0, 4, 0] : 0 }}
                        transition={{ duration: 1.4, repeat: hoverIndex === i ? Infinity : 0, ease: "easeInOut" }}
                        className={`${accent.text}`}
                      >
                        Explore
                      </motion.span>
                      <ArrowRight className={`w-4 h-4 ${accent.text}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View all components CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="text-center"
        >
          <Button
            size="lg"
            variant="outline"
            asChild
            className="relative px-8 py-5 font-semibold backdrop-blur-xl bg-card/40 border-border/50 hover:border-primary/40 transition-colors group overflow-hidden"
          >
            <Link href="/components/accordion" className="inline-flex items-center gap-2">
              <motion.div
                aria-hidden="true"
                initial={{ x: "-110%" }}
                whileHover={{ x: "110%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent skew-x-12"
              />
              <span className="relative z-10">Explore All Components</span>
              <motion.span
                aria-hidden="true"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
