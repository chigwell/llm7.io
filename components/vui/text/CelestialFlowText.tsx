"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CelestialFlowTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function CelestialFlowText({
  text,
  className,
  delay = 0.025,
}: CelestialFlowTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      x.set(e.clientX - rect.left - rect.width / 2);
      y.set(e.clientY - rect.top - rect.height / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{  perspective: 1000 }}
      className={cn(className
)}

    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * delay,
            type: "spring",
            stiffness: 150,
            damping: 12,
          }}
          className="inline-block drop-shadow-[0_0_10px_rgba(200,200,255,0.6)] relative text-5xl md:text-7xl font-bold select-none tracking-wide
     bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 dark:from-amber-400 dark:via-pink-400 dark:to-purple-500
     bg-clip-text text-transparent animate-gradient bg-[length:400%_400%]"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
