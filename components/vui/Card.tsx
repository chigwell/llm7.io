"use client";

import Image, { StaticImageData } from "next/image";
import GIRL from "@/public/BG.jpg";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type VuiCardProps = {
  imageSrc: StaticImageData | string;
  imageAlt: string;
  category?: string;
  title?: string;
  description?: React.ReactNode;
};

function VuiCard({
  imageSrc,
  imageAlt,
  category = "Animations / Design / Branding",
  title = "Ideas Made Visuals",
  description = (
    <>
      We help brands break the mold with visuals that do{" "}
      <span className="text-orange-400">more than look good</span> — they tell{" "}
      <span className="text-orange-400">stories, spark</span> interest, and
      drive action.
    </>
  ),
}: VuiCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card className="overflow-hidden border-1 border-gray-500 bg-white/5 backdrop-blur-md w-full h-full">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover"
        priority
        aria-hidden="true"
      />
      <div className={`absolute inset-1 ${isMobile ? 'p-1' : 'p-2'} flex flex-col justify-between h-full`}>
        <CardHeader className={isMobile ? 'p-2' : ''}>
          <CardDescription className={`text-white/80 ${isMobile ? 'text-xs' : 'text-sm'} font-medium tracking-wide`}>
            {category}
          </CardDescription>
        </CardHeader>
        <div className="relative">
          <div
            className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-xl z-0 blur-2xl shadow-2xl shadow-black/30"
            aria-hidden="true"
          />
          <CardContent className={`relative z-10 ${isMobile ? 'p-2' : 'p-4'}`}>
            <CardTitle className={`text-white ${isMobile ? 'text-base' : 'text-xl'} font-bold leading-tight text-shadow-md`}>
              {title}
            </CardTitle>
            <p className={`text-white/90 ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed text-shadow-sm mt-2`}>
              {description}
            </p>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

export default function CardShowcase() {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 md:space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Card Component
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Beautiful overlay cards with backdrop blur effects and dynamic
              content positioning
            </p>
          </div>

          {/* Main Demo */}
          <div className="relative p-4 md:p-8 rounded-3xl bg-card/30 backdrop-blur-sm border border-border/50 shadow-2xl">
            <div className="flex justify-center">
              <section
                className={`relative w-full ${isMobile ? 'max-w-sm h-[300px]' : 'max-w-xl h-[400px] md:h-[500px]'} mx-auto overflow-hidden rounded-3xl shadow-2xl`}
                aria-label="Featured Card: Ideas Made Visuals"
              >
                <div className="absolute inset-0" aria-hidden="true">
                  <Image
                    src={GIRL}
                    alt="Abstract background with a girl, used for card visual design."
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className={`absolute ${isMobile ? 'inset-3' : 'inset-6 sm:inset-12'}`}>
                  <VuiCard
                    imageSrc={GIRL}
                    imageAlt="Card background visual, blurred for effect."
                  />
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Card Variations */}
        <div className="space-y-8 md:space-y-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Card Variations</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Design Agency Card */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-blue-700 dark:text-blue-300">
                  Design Agency
                </h3>
                <p className="text-sm text-muted-foreground">
                  Creative portfolio showcase
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50/30 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-4 rounded-2xl border border-blue-200/30 dark:border-blue-800/20">
                <section
                  className={`relative w-full ${isMobile ? 'h-[250px]' : 'h-[300px] md:h-[400px]'} overflow-hidden rounded-2xl shadow-xl`}
                  aria-label="Design Agency Card"
                >
                  <div className="absolute inset-0" aria-hidden="true">
                    <Image
                      src={GIRL}
                      alt="Creative design background"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-purple-900/20" />
                  </div>
                  <div className={`absolute ${isMobile ? 'inset-2' : 'inset-4'}`}>
                    <VuiCard
                      imageSrc={GIRL}
                      imageAlt="Design portfolio background"
                      category="Design / Branding / Strategy"
                      title="Creative Excellence"
                      description={
                        <>
                          We craft digital experiences that{" "}
                          <span className="text-blue-400">captivate</span> and{" "}
                          <span className="text-blue-400">convert</span>,
                          blending creativity with strategy.
                        </>
                      }
                    />
                  </div>
                </section>
              </div>
            </div>

            {/* Tech Startup Card */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-green-700 dark:text-green-300">
                  Tech Startup
                </h3>
                <p className="text-sm text-muted-foreground">
                  Modern technology focus
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50/30 to-emerald-100/20 dark:from-green-950/20 dark:to-emerald-900/10 p-4 rounded-2xl border border-green-200/30 dark:border-green-800/20">
                <section
                  className={`relative w-full ${isMobile ? 'h-[250px]' : 'h-[300px] md:h-[400px]'} overflow-hidden rounded-2xl shadow-xl`}
                  aria-label="Tech Startup Card"
                >
                  <div className="absolute inset-0" aria-hidden="true">
                    <Image
                      src={GIRL}
                      alt="Technology background"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-teal-900/20" />
                  </div>
                  <div className={`absolute ${isMobile ? 'inset-2' : 'inset-4'}`}>
                    <VuiCard
                      imageSrc={GIRL}
                      imageAlt="Tech innovation background"
                      category="Technology / Innovation / AI"
                      title="Future Forward"
                      description={
                        <>
                          Building tomorrow&apos;s solutions with{" "}
                          <span className="text-green-400">
                            cutting-edge tech
                          </span>{" "}
                          and{" "}
                          <span className="text-green-400">
                            innovative thinking
                          </span>
                          .
                        </>
                      }
                    />
                  </div>
                </section>
              </div>
            </div>

            {/* Lifestyle Brand Card */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-purple-700 dark:text-purple-300">
                  Lifestyle Brand
                </h3>
                <p className="text-sm text-muted-foreground">
                  Elegant and sophisticated
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50/30 to-violet-100/20 dark:from-purple-950/20 dark:to-violet-900/10 p-4 rounded-2xl border border-purple-200/30 dark:border-purple-800/20">
                <section
                  className={`relative w-full ${isMobile ? 'h-[250px]' : 'h-[300px] md:h-[400px]'} overflow-hidden rounded-2xl shadow-xl`}
                  aria-label="Lifestyle Brand Card"
                >
                  <div className="absolute inset-0" aria-hidden="true">
                    <Image
                      src={GIRL}
                      alt="Lifestyle brand background"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-pink-900/20" />
                  </div>
                  <div className={`absolute ${isMobile ? 'inset-2' : 'inset-4'}`}>
                    <VuiCard
                      imageSrc={GIRL}
                      imageAlt="Lifestyle elegance background"
                      category="Lifestyle / Fashion / Luxury"
                      title="Refined Elegance"
                      description={
                        <>
                          Curating experiences that embody{" "}
                          <span className="text-purple-400">
                            sophistication
                          </span>{" "}
                          and{" "}
                          <span className="text-purple-400">
                            timeless style
                          </span>
                          .
                        </>
                      }
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* Different Layouts */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Layout Examples</h2>
            <p className="text-muted-foreground">
              Various card arrangements and compositions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Compact Layout */}
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-semibold text-orange-700 dark:text-orange-300 text-center">
                Compact Layout
              </h3>

              <div className="bg-gradient-to-br from-orange-50/30 to-amber-100/20 dark:from-orange-950/20 dark:to-amber-900/10 p-4 md:p-6 rounded-2xl border border-orange-200/30 dark:border-orange-800/20">
                <section
                  className={`relative w-full ${isMobile ? 'h-[200px]' : 'h-[250px] md:h-[300px]'} overflow-hidden rounded-xl shadow-lg`}
                  aria-label="Compact Card Layout"
                >
                  <div className="absolute inset-0" aria-hidden="true">
                    <Image
                      src={GIRL}
                      alt="Compact layout background"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                  <div className={`absolute ${isMobile ? 'inset-2' : 'inset-3'}`}>
                    <VuiCard
                      imageSrc={GIRL}
                      imageAlt="Compact card visual"
                      category="Photography / Art"
                      title="Visual Stories"
                      description={
                        <>
                          Capturing moments that{" "}
                          <span className="text-orange-400">inspire</span> and{" "}
                          <span className="text-orange-400">connect</span>.
                        </>
                      }
                    />
                  </div>
                </section>
              </div>
            </div>

            {/* Wide Layout */}
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-semibold text-rose-700 dark:text-rose-300 text-center">
                Wide Format
              </h3>

              <div className="bg-gradient-to-br from-rose-50/30 to-pink-100/20 dark:from-rose-950/20 dark:to-pink-900/10 p-4 md:p-6 rounded-2xl border border-rose-200/30 dark:border-rose-800/20">
                <section
                  className={`relative w-full ${isMobile ? 'h-[200px]' : 'h-[250px] md:h-[300px]'} overflow-hidden rounded-xl shadow-lg`}
                  aria-label="Wide Format Card"
                >
                  <div className="absolute inset-0" aria-hidden="true">
                    <Image
                      src={GIRL}
                      alt="Wide format background"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-900/40 to-transparent" />
                  </div>
                  <div className={`absolute ${isMobile ? 'inset-2' : 'inset-4'}`}>
                    <VuiCard
                      imageSrc={GIRL}
                      imageAlt="Wide format card visual"
                      category="Events / Experiences"
                      title="Memorable Moments"
                      description={
                        <>
                          Creating unforgettable experiences through{" "}
                          <span className="text-rose-400">
                            thoughtful design
                          </span>{" "}
                          and{" "}
                          <span className="text-rose-400">
                            attention to detail
                          </span>
                          .
                        </>
                      }
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardTheme() {
  const isMobile = useIsMobile();
  
  return (
    <>
          <section
            className="w-full h-full rounded-2xl"
            aria-label="Tech Startup Card"
          >
            <div className="absolute inset-0 w-full h-full" aria-hidden="true">
              <Image
                src={GIRL}
                alt="Technology background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-teal-900/20" />
            </div>
            <div className={`absolute ${isMobile ? 'inset-2' : 'inset-4'}`}>
              <VuiCard
                imageSrc={GIRL}
                imageAlt="Tech innovation background"
                category="Technology / Innovation / AI"
                title="Future Forward"
                description={
                  <>
                    Building tomorrow&apos;s solutions with{" "}
                    <span className="text-green-400">cutting-edge tech</span>{" "}
                    and{" "}
                    <span className="text-green-400">innovative thinking</span>.
                  </>
                }
              />
            </div>
          </section>
    </>
  );
}
