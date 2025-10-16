"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/buttonShadcn";
import { Github, Linkedin, Twitter, Heart } from "lucide-react";

export default function Footer() {
  // This prevents the footer from rendering during initial hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render the footer until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <footer className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand section */}
          <div className="sm:col-span-2 space-y-4 md:space-y-6">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <Icons.logo className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Vyoma UI</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Truly Beyond UI
                </p>
              </div>
            </Link>

            <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
              A modern UI design system crafted with spatial wisdom and
              thoughtful design. Build beautiful interfaces that feel natural
              and intuitive.
            </p>

            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <span>Built with</span>
              <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-500 fill-current" />
              <span>by</span>
              <Link
                href="https://www.srijanbaniyal.com"
                target="_blank"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                @srijanbaniyal
              </Link>
            </div>

            {/* Social buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                asChild
              >
                <Link
                  href="https://github.com/Srijan-Baniyal/vyoma-ui"
                  target="_blank"
                  className="gap-2 justify-center sm:justify-start"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                asChild
              >
                <Link
                  href="https://www.linkedin.com/in/srijan-baniyal/"
                  target="_blank"
                  className="gap-2 justify-center sm:justify-start"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                asChild
              >
                <Link
                  href="https://x.com/compose/"
                  target="_blank"
                  className="gap-2 justify-center sm:justify-start"
                >
                  <Twitter className="w-4 h-4" />
                  Share
                </Link>
              </Button>
            </div>
          </div>

          {/* Documentation links */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold text-foreground text-sm md:text-base">
              Documentation
            </h3>
            <ul className="space-y-2 md:space-y-3 text-sm">
              <li>
                <Link
                  href="/get-started/introduction"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Getting Started
                </Link>
              </li>
              <li>
                <Link
                  href="/components/accordion"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Components
                </Link>
              </li>
              <li>
                <Link
                  href="/showcase"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Showcase
                </Link>
              </li>
              <li>
                <Link
                  href="/themes "
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Themes
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold text-foreground text-sm md:text-base">
              Legal
            </h3>
            <ul className="space-y-2 md:space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/tos"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/license"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  License
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-6 md:pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Vyoma UI. All rights reserved.
            </p>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Powered by</p>
              {/* Mobile-friendly tech stack */}
              <div className="flex flex-wrap justify-center items-center gap-2 text-xs text-muted-foreground max-w-sm md:max-w-none">
                <span>Next.js</span>
                <span className="hidden sm:inline">•</span>
                <span>TypeScript</span>
                <span className="hidden sm:inline">•</span>
                <span>Tailwind CSS</span>
                <span className="hidden sm:inline">•</span>
                <span>Shadcn UI</span>
                <span className="hidden sm:inline">•</span>
                <span>GSAP</span>
                <span className="hidden sm:inline">•</span>
                <span>Motion</span>
                <span className="hidden lg:inline">•</span>
                <span className="hidden lg:inline">Three.js</span>
                <span className="hidden lg:inline">•</span>
                <span className="hidden lg:inline">Vanta.js</span>
                <span className="hidden lg:inline">•</span>
                <span className="hidden lg:inline">Animate.js</span>
              </div>
              {/* Secondary row for larger screens */}
              <div className="hidden lg:flex justify-center items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="lg:hidden">Three.js</span>
                <span className="lg:hidden">•</span>
                <span className="lg:hidden">Vanta.js</span>
                <span className="lg:hidden">•</span>
                <span className="lg:hidden">Animate.js</span>
              </div>
            </div>
          </div>
        </div>

        {/* Large brand text */}
        <div className="w-full flex mt-12 md:mt-16 items-center justify-center">
          <h1 className="text-center text-3xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-[8rem] font-black bg-gradient-to-b from-foreground/10 to-foreground/5 bg-clip-text text-transparent select-none leading-none">
            VYOMA UI
          </h1>
        </div>
      </div>
    </footer>
  );
}
