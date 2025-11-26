"use client";

import { useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Gauge, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/buttonShadcn";

type ModelCard = {
  name: string;
  tagline: string;
  description: string;
  icon: ReactNode;
  accent: "purple" | "emerald" | "amber";
  cta: string;
};

const cards: ModelCard[] = [
  {
    name: "Default",
    tagline: "Balanced starter",
    description: "First available model with a steady mix of quality and speed. Random routing keeps you on the healthiest path.",
    icon: <Sparkles className="h-6 w-6" />,
    accent: "purple",
    cta: "Try default model",
  },
  {
    name: "Fast",
    tagline: "Priority on speed",
    description: "Routes to the fastest available option for quick answers when latency matters most. Still picked from what is online.",
    icon: <Gauge className="h-6 w-6" />,
    accent: "emerald",
    cta: "Try fast model",
  },
  {
    name: "Pro",
    tagline: "Largest capabilities",
    description: "Targets the most capable models in the pool for richer responses, even if they take a bit longer to reply.",
    icon: <Rocket className="h-6 w-6" />,
    accent: "amber",
    cta: "Try pro model",
  },
];

const accentStyles = {
  purple: "from-purple-500/20 to-indigo-500/20 text-purple-100 border-purple-400/40",
  emerald: "from-emerald-500/20 to-green-500/20 text-emerald-100 border-emerald-400/40",
  amber: "from-amber-500/20 to-orange-500/20 text-amber-100 border-amber-400/40",
} as const;

export default function ModelShowcase() {
  const scrollToExample = useCallback(() => {
    const el = document.getElementById("example");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section id="models" aria-labelledby="model-heading" className="relative py-16 md:py-20 bg-gradient-to-b from-background via-background/70 to-background">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.06),_transparent_35%)]" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2
            id="model-heading"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          >
            Choose how we route your model.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed"
          >
            Default, Fast, and Pro are all selected at random from the service&apos;s available capabilities so requests stay healthy and performant.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7 mt-10">
          {cards.map((card, idx) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <div className="h-full rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-lg p-6 md:p-7 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border bg-gradient-to-br ${accentStyles[card.accent]}`} style={{ color: 'white' }}>
                    {card.icon}
                  </div>
                  <div>
                    <div className="text-sm uppercase tracking-[0.1em] text-muted-foreground">{card.tagline}</div>
                    <div className="text-xl font-semibold">{card.name}</div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{card.description}</p>

                <Button variant="outline" className="w-full" onClick={scrollToExample}>
                  {card.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Requests are shuffled across providers to stay online while matching the speed or capability profile you pick.
        </div>
      </div>
    </section>
  );
}
