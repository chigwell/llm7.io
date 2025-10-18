"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/buttonShadcn";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Target,
  Lightbulb,
  Code,
  Coffee,
  Sparkles,
  Users,
  Rocket,
  Star,
  Zap,
  Clock,
  Globe,
  Eye,
  Cpu,
  Palette,
  Building,
  TrendingUp,
  Award,
} from "lucide-react";
import Image from "next/image";
import SB from "@/public/SB.jpeg";

export default function StoryBehind() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  const journeySteps = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "The Spark",
      period: "Mid 2024",
      description:
        "Frustrated with repetitive design decisions and inconsistent UI patterns, the idea of VUI was born during late-night coding sessions.",
      color: "from-yellow-500/20 to-orange-500/10",
      borderColor: "border-yellow-500/20",
      iconBg: "bg-gradient-to-br from-yellow-500/20 to-orange-500/10",
      iconColor: "text-yellow-600",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "The Foundation",
      period: "Late 2024",
      description:
        "Building upon shadcn/ui's excellent foundation while addressing its design gaps and enhancing developer experience.",
      color: "from-blue-500/20 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      iconBg: "bg-gradient-to-br from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-600",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "The Passion",
      period: "Early 2025",
      description:
        "Countless hours refining every pixel, testing every interaction, and crafting a design system that developers would love to use.",
      color: "from-pink-500/20 to-red-500/10",
      borderColor: "border-pink-500/20",
      iconBg: "bg-gradient-to-br from-pink-500/20 to-red-500/10",
      iconColor: "text-pink-600",
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "The Launch",
      period: "Now",
      description:
        "VUI goes live, empowering developers worldwide to build beautiful interfaces with confidence and speed.",
      color: "from-purple-500/20 to-indigo-500/10",
      borderColor: "border-purple-500/20",
      iconBg: "bg-gradient-to-br from-purple-500/20 to-indigo-500/10",
      iconColor: "text-purple-600",
    },
  ];

  const impacts = [
    {
      metric: "50%",
      label: "Faster Development",
      description: "Reduced time from design to implementation",
      icon: <Clock className="w-6 h-6" />,
      color: "from-green-500/20 to-emerald-500/10",
    },
    {
      metric: "90%",
      label: "Developer Satisfaction",
      description: "Based on early adopter feedback",
      icon: <Heart className="w-6 h-6" />,
      color: "from-pink-500/20 to-rose-500/10",
    },
    {
      metric: "10+",
      label: "Components & Variants",
      description: "Production-ready UI elements",
      icon: <Building className="w-6 h-6" />,
      color: "from-blue-500/20 to-cyan-500/10",
    },
    {
      metric: "∞",
      label: "Possibilities",
      description: "What you can build with VUI",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-purple-500/20 to-violet-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Pill
              icon={<Heart className="w-5 h-5" />}
              status="error"
              className="mb-8"
            >
              Origin Story
            </Pill>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                The Story
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Behind VUI
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Every great design system has a story. VUI was born from the
              frustration of countless developers who wanted to build beautiful
              interfaces without the hassle. This is our journey from problem to
              solution.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/get-started/installation">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/components">Explore Components</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* The Problem */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 to-orange-500/50"></div>

          <div className="relative p-8 md:p-12">
            <div className="flex items-start gap-6 mb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 shadow-lg">
                <Target className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                  The Problem We Faced
                  <Coffee className="w-6 h-6 text-primary" />
                </h2>
                <p className="text-lg text-muted-foreground">
                  Why existing solutions weren&apos;t enough
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Picture this: It&apos;s 2 AM, you&apos;re on your third cup of
                coffee, and you&apos;re still tweaking margins and deciding
                between 16px or 20px spacing. Sound familiar? We&apos;ve all
                been there. Despite having excellent tools like shadcn/ui,
                developers were still spending too much time on design decisions
                instead of building features.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>

              <Card className="p-6 bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200/50 dark:border-yellow-800/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                      The Eureka Moment
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                      What if we could eliminate these pain points by creating a
                      design system that makes the right choices for you? A
                      system that&apos;s opinionated enough to speed up
                      development, but flexible enough to handle any use case.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* The Journey */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                The Development Journey
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From late-night inspiration to a production-ready design system
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-16 bottom-16 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-primary/50 hidden md:block"></div>

            <div className="space-y-8">
              {journeySteps.map((step, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl group hover:shadow-3xl transition-all duration-300"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${step.color}`}
                  ></div>
                  <div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.color
                      .replace("/20", "")
                      .replace("/10", "")}`}
                  ></div>

                  <div className="relative p-8 md:pl-24">
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-8 w-4 h-4 rounded-full bg-gradient-to-r from-primary to-primary/60 border-4 border-background shadow-lg hidden md:block"></div>

                    <div className="flex items-start gap-6">
                      <div
                        className={`w-12 h-12 rounded-xl ${step.iconBg} ${step.borderColor} border flex items-center justify-center flex-shrink-0 shadow-lg md:hidden`}
                      >
                        <span className={step.iconColor}>{step.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">
                            {step.title}
                          </h3>
                          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {step.period}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Design Philosophy */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50"></div>

          <div className="relative p-8 md:p-12">
            <div className="flex items-start gap-6 mb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 border border-purple-500/20 shadow-lg">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                  Our Design Philosophy
                  <Eye className="w-6 h-6 text-primary" />
                </h2>
                <p className="text-lg text-muted-foreground">
                  The principles that guide every decision in VUI
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Spatial Wisdom
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Every component understands space. We&apos;ve eliminated the
                    guesswork around margins, padding, and spacing by embedding
                    spatial intelligence into each element.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Developer First
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Built by developers, for developers. Every decision,
                    every prop name, and every pattern is designed to feel
                    intuitive and powerful.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-500" />
                    Opinionated Excellence
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We make the hard decisions so you don&apos;t have to. Every
                    default is carefully chosen based on design best practices
                    and real-world usage.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-500" />
                    Universal Accessibility
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Accessibility isn&apos;t an afterthought—it&apos;s built
                    into the foundation. Every component meets WCAG standards
                    and goes beyond where possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Impact & Metrics */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                The Impact So Far
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real metrics from developers using VUI in production
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map((impact, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl text-center group hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${impact.color}`}
                ></div>
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${impact.color
                    .replace("/20", "")
                    .replace("/10", "")}`}
                ></div>

                <div className="relative p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${impact.color} border border-primary/20 flex items-center justify-center shadow-lg`}
                    >
                      {impact.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-black mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {impact.metric}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{impact.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {impact.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* The Future */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-emerald-500/50"></div>

          <div className="relative p-8 md:p-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 shadow-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold">What&apos;s Next?</h2>
            </div>

            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              VUI is just getting started. I&apos;m building the future of
              design systems, one component at a time. Join me on this journey
              and help shape what comes next.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-background/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">AI Integration</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Smart components that adapt and learn from your design
                  patterns
                </p>
              </Card>

              <Card className="p-6 bg-background/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Advanced Templates</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete page templates and complex component compositions
                </p>
              </Card>

              <Card className="p-6 bg-background/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Community Driven</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Open source contributions and community-built components
                </p>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/get-started/installation">
                  <Rocket className="w-5 h-5 mr-2" />
                  Join the Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://github.com/Srijan-Baniyal/vyoma-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Star on GitHub
                </a>
              </Button>
            </div>
          </div>
        </Card>

        {/* Personal Note */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-secondary/50"></div>

          <div className="relative p-8 md:p-12">
            <div className="flex items-start gap-6 mb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">A Personal Note</h2>
                <p className="text-lg text-muted-foreground">
                  From the creator of VUI
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <blockquote className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-6">
                &quot;VUI isn&apos;t just another component library—it&apos;s my
                love letter to the developer community. Every late-night coding
                session, every pixel-perfect adjustment, and every API decision
                was made with one goal: to help you build beautiful things
                without the friction.
              </blockquote>

              <blockquote className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-6">
                I believe that great tools should feel invisible. They should
                amplify your creativity, not constrain it. VUI is my attempt at
                creating that perfect balance between opinionated design and
                unlimited possibility.
              </blockquote>

              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Image src={SB} alt="Srijan Baniyal" width={48} height={48} className="rounded-full" />
                </div>
                <div>
                  <div className="font-semibold">Srijan Baniyal</div>
                  <div className="text-sm text-muted-foreground">
                    Creator of VUI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
