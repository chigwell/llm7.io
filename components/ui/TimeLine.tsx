"use client";

import { motion, useInView } from "motion/react";
import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import {
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Calendar,
  Tag,
} from "lucide-react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  date?: string;
  icon?: React.ReactNode;
  tag?: string;
  color?: string;
}

interface TimelineProps {
  data: TimelineEntry[];
  title?: string;
  subtitle?: string;
}

const TimelineItem = ({
  item,
  index,
  isLast,
}: {
  item: TimelineEntry;
  index: number;
  isLast: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const colorSchemes = {
    purple: {
      gradient: "from-purple-500/5 via-transparent to-purple-500/5",
      topBorder: "from-purple-500/50 to-purple-500/50",
      iconBg: "from-purple-500/20 to-purple-500/10",
      iconBorder: "border-purple-500/20",
      iconText: "text-purple-600",
      tagBg: "from-purple-500 to-purple-600",
      hoverGlow: "group-hover:shadow-purple-500/25",
      decorative1: "from-purple-400/20 to-purple-500/10",
      decorative2: "from-purple-300/15 to-purple-400/5",
    },
    blue: {
      gradient: "from-blue-500/5 via-transparent to-blue-500/5",
      topBorder: "from-blue-500/50 to-blue-500/50",
      iconBg: "from-blue-500/20 to-blue-500/10",
      iconBorder: "border-blue-500/20",
      iconText: "text-blue-600",
      tagBg: "from-blue-500 to-blue-600",
      hoverGlow: "group-hover:shadow-blue-500/25",
      decorative1: "from-blue-400/20 to-blue-500/10",
      decorative2: "from-blue-300/15 to-blue-400/5",
    },
    green: {
      gradient: "from-green-500/5 via-transparent to-green-500/5",
      topBorder: "from-green-500/50 to-green-500/50",
      iconBg: "from-green-500/20 to-green-500/10",
      iconBorder: "border-green-500/20",
      iconText: "text-green-600",
      tagBg: "from-green-500 to-green-600",
      hoverGlow: "group-hover:shadow-green-500/25",
      decorative1: "from-green-400/20 to-green-500/10",
      decorative2: "from-green-300/15 to-green-400/5",
    },
    orange: {
      gradient: "from-orange-500/5 via-transparent to-orange-500/5",
      topBorder: "from-orange-500/50 to-orange-500/50",
      iconBg: "from-orange-500/20 to-orange-500/10",
      iconBorder: "border-orange-500/20",
      iconText: "text-orange-600",
      tagBg: "from-orange-500 to-orange-600",
      hoverGlow: "group-hover:shadow-orange-500/25",
      decorative1: "from-orange-400/20 to-orange-500/10",
      decorative2: "from-orange-300/15 to-orange-400/5",
    },
    pink: {
      gradient: "from-pink-500/5 via-transparent to-pink-500/5",
      topBorder: "from-pink-500/50 to-pink-500/50",
      iconBg: "from-pink-500/20 to-pink-500/10",
      iconBorder: "border-pink-500/20",
      iconText: "text-pink-600",
      tagBg: "from-pink-500 to-pink-600",
      hoverGlow: "group-hover:shadow-pink-500/25",
      decorative1: "from-pink-400/20 to-pink-500/10",
      decorative2: "from-pink-300/15 to-pink-400/5",
    },
    red: {
      gradient: "from-red-500/5 via-transparent to-red-500/5",
      topBorder: "from-red-500/50 to-red-500/50",
      iconBg: "from-red-500/20 to-red-500/10",
      iconBorder: "border-red-500/20",
      iconText: "text-red-600",
      tagBg: "from-red-500 to-red-600",
      hoverGlow: "group-hover:shadow-red-500/25",
      decorative1: "from-red-400/20 to-red-500/10",
      decorative2: "from-red-300/15 to-red-400/5",
    },
  };

  const selectedScheme =
    item.color && colorSchemes[item.color as keyof typeof colorSchemes]
      ? colorSchemes[item.color as keyof typeof colorSchemes]
      : colorSchemes.purple;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 60, scale: 0.95 }
      }
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.25, 0.25, 0, 1],
      }}
      className="relative flex items-start group"
    >
      {/* Enhanced Connector Line */}
      {!isLast && (
        <motion.div
          initial={{ height: 0 }}
          animate={isInView ? { height: "100%" } : { height: 0 }}
          transition={{ delay: index * 0.15 + 0.5, duration: 0.8 }}
          className="absolute left-8 top-20 w-0.5 bg-gradient-to-b from-border via-border/50 to-transparent"
        />
      )}

      {/* Enhanced Timeline Node */}
      <motion.div
        whileHover={{ scale: 1.15, rotate: 3 }}
        whileTap={{ scale: 0.9 }}
        className="relative z-10 flex-shrink-0"
      >
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedScheme.iconBg} ${selectedScheme.iconBorder} border shadow-lg flex items-center justify-center transition-all duration-500 ${selectedScheme.hoverGlow} group-hover:shadow-2xl group-hover:border-opacity-50`}
        >
          {item.icon ? (
            <motion.div
              className={`${selectedScheme.iconText} text-xl`}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {item.icon}
            </motion.div>
          ) : (
            <motion.div
              className={`w-3 h-3 ${selectedScheme.iconText} rounded-full`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>

        {/* Pulse Animation */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.3,
          }}
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${selectedScheme.iconBg} -z-10`}
        />
      </motion.div>

      {/* Enhanced Content Card */}
      <motion.div
        whileHover={{
          y: -8,
          boxShadow: "0 32px 64px -12px rgba(0, 0, 0, 0.2)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="ml-8 flex-1 mb-16"
      >
        <Card
          className={`relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl group-hover:shadow-3xl transition-all duration-700 ${selectedScheme.hoverGlow}`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-r ${selectedScheme.gradient}`}
          ></div>
          <div
            className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${selectedScheme.topBorder}`}
          ></div>

          {/* Decorative Elements */}
          <div
            className={`absolute top-6 right-6 w-24 h-24 bg-gradient-to-br ${selectedScheme.decorative1} rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
          />
          <div
            className={`absolute bottom-6 left-6 w-20 h-20 bg-gradient-to-br ${selectedScheme.decorative2} rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`}
          />

          <div className="relative p-8 md:p-10">
            {/* Enhanced Header */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <motion.h3
                    className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {item.title}
                  </motion.h3>
                  {item.tag && (
                    <motion.span
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: index * 0.15 + 0.6,
                        type: "spring",
                        stiffness: 300,
                      }}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      className={`px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${selectedScheme.tagBg} text-white shadow-lg flex items-center gap-2 self-start`}
                    >
                      <Tag className="w-3 h-3" />
                      {item.tag}
                    </motion.span>
                  )}
                </div>
                {item.date && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + 0.4 }}
                    className="inline-flex items-center gap-3 text-sm font-semibold text-muted-foreground bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 hover:border-border transition-colors duration-300"
                  >
                    <Calendar className="w-4 h-4" />
                    {item.date}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Enhanced Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: index * 0.15 + 0.7, duration: 0.8 }}
              className="text-muted-foreground leading-relaxed text-base md:text-lg relative z-10"
            >
              {item.content}
            </motion.div>

            {/* Hover Arrow Indicator */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedScheme.iconBg} ${selectedScheme.iconBorder} border flex items-center justify-center shadow-lg`}
              >
                <ArrowRight className={`w-4 h-4 ${selectedScheme.iconText}`} />
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export const Timeline = ({
  data,
  title = "Timeline of Innovation",
  subtitle = "A journey through remarkable milestones and achievements",
}: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isTitleInView = useInView(titleRef, { once: true });

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden"
      ref={containerRef}
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-3/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
          className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"
        />
      </div>

      {/* Enhanced Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 space-y-20">
        {/* Enhanced Header */}
        <div className="text-center space-y-8">
          <motion.div
            ref={titleRef}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={
              isTitleInView
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 40, scale: 0.95 }
            }
            transition={{ duration: 1, ease: [0.25, 0.25, 0, 1] }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Pill
                icon={<Clock className="w-5 h-5" />}
                status="active"
                className="mb-10"
              >
                Timeline Journey
              </Pill>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                {title.split(" ").slice(0, -1).join(" ")}
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                {title.split(" ").slice(-1)[0]}
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isTitleInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {subtitle}
            </motion.p>

            {/* Decorative line with animation */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={
                isTitleInView
                  ? { width: "120px", opacity: 1 }
                  : { width: 0, opacity: 0 }
              }
              transition={{ delay: 0.6, duration: 1 }}
              className="h-1.5 bg-gradient-to-r from-primary via-primary to-primary/60 mx-auto mt-10 rounded-full"
            />
          </motion.div>
        </div>

        {/* Enhanced Timeline Container */}
        <motion.div
          ref={ref}
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-secondary/60"></div>

            {/* Enhanced decorative elements */}
            <div className="absolute top-8 right-8 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-8 left-8 w-28 h-28 bg-gradient-to-br from-secondary/10 to-primary/5 rounded-full blur-2xl opacity-50" />

            <div className="relative p-10 md:p-16">
              <div className="space-y-0">
                {data.map((item, index) => (
                  <TimelineItem
                    key={index}
                    item={item}
                    index={index}
                    isLast={index === data.length - 1}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Enhanced Completion Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.8,
              type: "spring",
              stiffness: 300,
            }}
            className="flex justify-center mt-20"
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/90 backdrop-blur-xl group hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>

              <div className="relative p-8">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl flex items-center gap-3 mb-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                      Journey Continues...
                    </h3>
                    <p className="text-muted-foreground">
                      More incredible milestones await on the horizon
                    </p>
                  </div>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="opacity-50"
                  >
                    <ArrowRight className="w-6 h-6 text-green-600" />
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
