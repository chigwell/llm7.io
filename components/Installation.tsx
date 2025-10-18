import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { PackageManagerTabs } from "@/components/PackageManagerTabs";
import {
  CheckCircle,
  Terminal,
  Settings,
  Rocket,
  Code,
} from "lucide-react";
import { getDynamicStats } from "@/lib/ComponentCounter";

export default function Installation() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 space-y-16">
          {/* Header */}
          <div className="text-center space-y-6">
            <Pill icon={<Terminal className="w-5 h-5" />} status="active">
              Installation Guide
            </Pill>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Get Started with
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Vyoma UI
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your development workflow with our modern component
              library. Follow these steps to integrate Vyoma UI into your
              Next.js project.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="group">
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-secondary/50"></div>

                <div className="relative p-8 md:p-12">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-lg">
                      <span className="text-2xl font-black text-primary">
                        1
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                        Create Project
                        <Code className="w-6 h-6 text-primary" />
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        Set up a new Next.js project with all the essentials
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      Begin your journey by creating a fresh Next.js project
                      with TypeScript, Tailwind CSS, and ESLint. Choose your
                      preferred package manager below for the best development
                      experience.
                    </p>

                    <div className="space-y-4">
                      <PackageManagerTabs command="create-next-app@latest my-vyoma-app --typescript --tailwind --eslint" />

                      <Card className="p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                              Recommended Configuration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-800 dark:text-green-200">
                                  TypeScript for type safety
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-800 dark:text-green-200">
                                  Tailwind CSS for styling
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-800 dark:text-green-200">
                                  ESLint for code quality
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-800 dark:text-green-200">
                                  App Router for modern routing
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="group">
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-purple-500/50"></div>

                <div className="relative p-8 md:p-12">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 shadow-lg">
                      <span className="text-2xl font-black text-blue-600">
                        2
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                        Install Shadcn UI
                        <Settings className="w-6 h-6 text-blue-600" />
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        Add the foundation component library
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      Vyoma UI builds upon the excellent Shadcn UI foundation.
                      Install it to unlock a comprehensive collection of
                      beautifully designed, accessible components.
                    </p>

                    <div className="space-y-4">
                      <PackageManagerTabs command="shadcn@latest init" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="group">
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/50 to-red-500/50"></div>

                <div className="relative p-8 md:p-12">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20 shadow-lg">
                      <span className="text-2xl font-black text-orange-600">
                        3
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
                        Configure Components
                        <Settings className="w-6 h-6 text-orange-600" />
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        Customize your component setup
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      The initialization wizard will guide you through
                      configuring your{" "}
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        components.json
                      </code>{" "}
                      file with the perfect settings for your project.
                    </p>

                    <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted/20 border-dashed border-2">
                      <div className="space-y-4 font-mono text-sm">
                        <div className="flex items-center gap-4 p-3 rounded bg-background/50">
                          <span className="text-orange-500 font-semibold">
                            ?
                          </span>
                          <span className="text-muted-foreground">
                            Which style would you like to use?
                          </span>
                          <span className="ml-auto text-primary font-semibold">
                            New York
                          </span>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded bg-background/50">
                          <span className="text-orange-500 font-semibold">
                            ?
                          </span>
                          <span className="text-muted-foreground">
                            Which color would you like to use as base color?
                          </span>
                          <span className="ml-auto text-primary font-semibold">
                            Zinc
                          </span>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded bg-background/50">
                          <span className="text-orange-500 font-semibold">
                            ?
                          </span>
                          <span className="text-muted-foreground">
                            Do you want to use CSS variables for colors?
                          </span>
                          <span className="ml-auto text-primary font-semibold">
                            yes
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 4 */}
            <div className="group">
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>

                <div className="relative p-8 md:p-12">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 border border-green-500/30 shadow-lg">
                      <Rocket className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-3 text-green-800 dark:text-green-100">
                        🚀 You&apos;re Ready to Build!
                      </h2>
                      <p className="text-lg text-green-700 dark:text-green-200">
                        Start creating amazing interfaces
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <p className="text-green-800 dark:text-green-200 leading-relaxed text-lg">
                      Congratulations! Your development environment is now
                      configured with Vyoma UI. You&apos;re ready to build
                      beautiful, responsive interfaces with our comprehensive
                      component library.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Terminal className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-lg">
                            Browse Components
                          </h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          Explore our extensive library of pre-built components
                          and patterns.
                        </p>
                        <div className="text-sm text-blue-600 font-medium">
                          {getDynamicStats().totalComponents} Components
                          Available →
                        </div>
                      </Card>

                      <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Code className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="font-semibold text-lg">
                            View Examples
                          </h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          See real-world implementations and get inspired by our
                          examples.
                        </p>
                        <div className="text-sm text-purple-600 font-medium">
                          Live Examples →
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
