"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export type LogoItem = {
  src: string;
  darkSrc?: string;
  alt: string;
  href?: string;
  className?: string;
  containerClassName?: string;
};

export type AnimatedCarouselProps = {
  title?: string;
  logoCount?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  logos?: Array<string | LogoItem> | null;
  containerClassName?: string;
  titleClassName?: string;
  carouselClassName?: string;
  logoClassName?: string;
  itemsPerViewMobile?: number;
  itemsPerViewDesktop?: number;
  spacing?: string;
  padding?: string;
  logoContainerWidth?: string;
  logoContainerHeight?: string;
  logoImageWidth?: string;
  logoImageHeight?: string;
  logoMaxWidth?: string;
  logoMaxHeight?: string;
  durationSeconds?: number;
};

const fallbackLogos: LogoItem[] = [
  { src: "/logos/azure-color.svg", alt: "Azure", href: "https://azure.microsoft.com/en-us/products/ai-foundry/models/" },
  { src: "/logos/cloudflare-color.svg", alt: "Cloudflare", href: "https://cloudflare.com/" },
  { src: "/logos/deepseek-color.svg", alt: "DeepSeek", href: "https://deepseek.ai/" },
  { src: "/logos/Google_Symbol_0.svg", alt: "Google", href: "https://cloud.google.com/vertex-ai/" },
  { src: "/logos/MistralAI-light.svg", alt: "Mistral AI", href: "https://mistral.ai/" },
  { src: "/logos/idCFFrGr_W_logos.jpeg", alt: "Nebius", href: "https://nebius.com/" },
  { src: "/logos/nebula-block.png", alt: "Nebula Block", href: "https://www.nebulablock.com/" },
  { src: "/logos/ollama.svg", alt: "Ollama", href: "https://ollama.com/", className: "dark:invert" },
  {
    src: "/logos/OpenAI-light.svg",
    darkSrc: "/logos/OpenAI_Symbol_0.svg",
    alt: "OpenAI",
    href: "https://openai.com/",
    className: "scale-125",
  },
  {
    src: "/logos/pollinations-icon-seeklogo.svg",
    darkSrc: "/logos/pollinations_ai_logo_white.svg",
    alt: "Pollinations",
    href: "https://pollinations.ai/",
  },
  { src: "/logos/Scaleway_id_RaUxAYi_0.svg", alt: "Scaleway", href: "https://www.scaleway.com/" },
];

function normalizeLogo(logo: string | LogoItem, index: number): LogoItem {
  if (typeof logo === "string") {
    return {
      src: logo,
      alt: `Partner logo ${index + 1}`,
    };
  }

  return logo;
}

export function AnimatedCarousel({
  title = "Connected across the AI ecosystem",
  logoCount = 15,
  autoPlay = true,
  autoPlayInterval = 1000,
  logos = null,
  containerClassName = "",
  titleClassName = "",
  carouselClassName = "",
  logoClassName = "",
  spacing = "gap-10",
  padding = "py-12 md:py-16",
  logoContainerWidth = "w-28 md:w-36",
  logoContainerHeight = "h-14 md:h-16",
  logoImageWidth = "w-full",
  logoImageHeight = "h-9 md:h-10",
  logoMaxWidth = "max-w-28 md:max-w-32",
  logoMaxHeight = "max-h-9 md:max-h-10",
  durationSeconds,
}: AnimatedCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const directionRef = useRef(1);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const sourceLogos = useMemo(
    () =>
      logos?.length
        ? logos.map(normalizeLogo)
        : Array.from({ length: logoCount }, (_, index) => fallbackLogos[index % fallbackLogos.length]),
    [logoCount, logos]
  );
  const repeatedLogos = useMemo(() => [...sourceLogos, ...sourceLogos, ...sourceLogos], [sourceLogos]);
  const logoImageSizeClasses = cn(logoImageWidth, logoImageHeight, logoMaxWidth, logoMaxHeight);
  const resolvedDuration = durationSeconds ?? Math.max(28, sourceLogos.length * autoPlayInterval * 0.001 * 3);
  const pixelsPerFrame = Math.max(0.35, (sourceLogos.length * 152) / (resolvedDuration * 60));

  const normalizeScrollPosition = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const segmentWidth = scroller.scrollWidth / 3;
    if (!segmentWidth) return;

    if (scroller.scrollLeft < segmentWidth * 0.5) {
      scroller.scrollLeft += segmentWidth;
    } else if (scroller.scrollLeft > segmentWidth * 1.5) {
      scroller.scrollLeft -= segmentWidth;
    }
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollLeft = scroller.scrollWidth / 3;
  }, [sourceLogos]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!autoPlay || isPaused || prefersReducedMotion) return;

    const tick = () => {
      const scroller = scrollerRef.current;
      if (scroller) {
        scroller.scrollLeft += directionRef.current * pixelsPerFrame;
        normalizeScrollPosition();
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoPlay, isPaused, pixelsPerFrame, prefersReducedMotion]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;

      event.preventDefault();
      directionRef.current = delta > 0 ? 1 : -1;
      scroller.scrollLeft += delta;
      normalizeScrollPosition();
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <section
      className={cn("w-full overflow-hidden bg-background", padding, containerClassName)}
      aria-labelledby="ecosystem-logo-carousel-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn("flex flex-col", spacing)}>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="ecosystem-logo-carousel-heading"
              className={cn("text-2xl md:text-3xl font-bold tracking-tight text-foreground", titleClassName)}
            >
              {title}
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Works with major model providers and infrastructure platforms through one API layer.
            </p>
          </div>

          <div
            ref={viewportRef}
            className={cn(
              "relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
              carouselClassName
            )}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={scrollerRef}
              className="scrollbar-none overflow-x-auto overscroll-x-contain"
              aria-label="AI ecosystem logos"
            >
              <div className="flex w-max items-center gap-6 md:gap-10">
                {repeatedLogos.map((logo, index) => (
                  <a
                    href={logo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${logo.alt} in a new tab`}
                    className={cn(
                      "relative flex shrink-0 items-center justify-center p-3 opacity-70 transition-opacity duration-300 hover:opacity-100",
                      logoContainerWidth,
                      logoContainerHeight,
                      logo.containerClassName,
                      logoClassName
                    )}
                    key={`${logo.alt}-${index}`}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={160}
                      height={80}
                      sizes="(max-width: 768px) 112px, 144px"
                      className={cn("object-contain", logo.darkSrc && "dark:hidden", logoImageSizeClasses, logo.className)}
                    />
                    {logo.darkSrc ? (
                      <Image
                        src={logo.darkSrc}
                        alt={logo.alt}
                        width={160}
                        height={80}
                        sizes="(max-width: 768px) 112px, 144px"
                        className={cn("hidden object-contain dark:block", logoImageSizeClasses, logo.className)}
                      />
                    ) : null}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Case1(props: AnimatedCarouselProps) {
  return <AnimatedCarousel {...props} />;
}
