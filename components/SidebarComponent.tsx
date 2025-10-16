"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Home,
  X,
  ExternalLink,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { componentMap } from "@/data/ComponentMapping";
import type { ComponentEntry } from "@/data/ComponentMapping";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/buttonShadcn";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import V from "@/public/VyomaUI.svg";
import Footer from "@/components/Footer";
import parser from "html-react-parser";

interface SidebarComponentProps {
  children: React.ReactNode;
}

const ANIMATION_DURATION = 0.15;
const SEARCH_DEBOUNCE_MS = 150;

// Enhanced animation variants with reduced motion support
const createAnimationVariants = (shouldReduceMotion: boolean) => ({
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: shouldReduceMotion ? 0 : ANIMATION_DURATION },
  },
  pageTransition: {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : -8 },
    transition: { duration: shouldReduceMotion ? 0 : ANIMATION_DURATION },
  },
  collapsibleContent: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: {
      duration: shouldReduceMotion ? 0 : ANIMATION_DURATION,
    },
  },
});

export default function SidebarComponent({ children }: SidebarComponentProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => {
      // Try to load from localStorage first, then default to all open
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("sidebar-categories");
          if (saved) {
            return JSON.parse(saved);
          }
        } catch (error) {
          console.warn("Failed to load sidebar state:", error);
        }
      }

      // Default: all categories open
      const initial: Record<string, boolean> = {};
      Object.keys(componentMap).forEach((category) => {
        initial[category] = true;
      });
      return initial;
    }
  );

  const animations = useMemo(
    () => createAnimationVariants(shouldReduceMotion ?? false),
    [shouldReduceMotion]
  );

  // Debounced search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Optimized filtered components with useMemo
  const filteredComponents = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return componentMap;
    }

    const query = debouncedSearchQuery.toLowerCase();
    const filtered: Record<string, ComponentEntry[]> = {};

    Object.entries(componentMap).forEach(([category, components]) => {
      const matchedComponents = components.filter(
        (comp) =>
          comp.name.toLowerCase().includes(query) ||
          comp.description?.toLowerCase().includes(query)
      );

      if (matchedComponents.length > 0) {
        filtered[category] = matchedComponents;
      }
    });

    return filtered;
  }, [debouncedSearchQuery]);

  // Initialize dark mode state
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  // Optimized handlers with useCallback
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleThemeToggle = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
  }, [isDarkMode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setOpenCategories((prev) => {
      const newState = {
        ...prev,
        [category]: !prev[category],
      };

      // Save to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sidebar-categories", JSON.stringify(newState));
        } catch (error) {
          console.warn("Failed to save sidebar state:", error);
        }
      }

      return newState;
    });
  }, []);

  // Enhanced breadcrumb generation with memoization
  const breadcrumbs = useMemo((): {
    label: string;
    href: string;
    isActive: boolean;
  }[] => {
    const items: { label: string; href: string; isActive: boolean }[] = [
      { label: "Home", href: "/", isActive: pathname === "/" },
    ];

    // Find component info more efficiently
    for (const [category, components] of Object.entries(componentMap)) {
      const component = components.find((comp) => comp.route === pathname);
      if (component) {
        items.push(
          { label: category, href: "#", isActive: false },
          { label: component.name, href: pathname, isActive: true }
        );
        return items;
      }
    }

    // Fallback for unknown routes
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      items.push({
        label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1),
        href: pathname,
        isActive: true,
      });
    }

    return items;
  }, [pathname]);

  const BreadcrumbNavigation = React.memo(() => (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={`${breadcrumb.href}-${index}`}>
            <BreadcrumbItem>
              {breadcrumb.isActive ? (
                <BreadcrumbPage className="flex items-center gap-1.5 text-primary font-medium">
                  {index === 0 && <Home className="size-3.5" />}
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  asChild
                  className="flex items-center gap-1.5 hover:text-primary transition-colors duration-200"
                >
                  <Link href={breadcrumb.href}>
                    {index === 0 && <Home className="size-3.5" />}
                    {breadcrumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  ));

  BreadcrumbNavigation.displayName = "BreadcrumbNavigation";

  const SidebarMenuItemComponent = React.memo(
    ({ comp }: { comp: ComponentEntry }) => {
      const isActive = pathname === comp.route;

      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                asChild
                className={cn(
                  "group h-9 px-3 text-sm rounded-lg transition-all duration-200 flex items-center gap-2.5 relative overflow-hidden",
                  isActive
                    ? "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20"
                    : "hover:bg-accent/70 hover:text-accent-foreground hover:shadow-sm"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Link
                  href={comp.route}
                  className="flex items-center gap-2.5 w-full min-w-0"
                >
                  <motion.div
                    className={cn(
                      "size-2 rounded-full flex-shrink-0",
                      isActive
                        ? "bg-primary shadow-sm"
                        : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                    )}
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="truncate font-medium">{comp.name}</span>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-[220px] p-3 bg-background border shadow-lg"
              sideOffset={8}
            >
              <div className="space-y-1">
                <p className="font-medium text-sm dark:text-white text-black">
                  {comp.name}
                </p>
                {comp.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {parser(comp.description)}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  );

  SidebarMenuItemComponent.displayName = "SidebarMenuItemComponent";

  return (
    <div onKeyDown={handleKeyDown}>
      <SidebarProvider>
        <Sidebar className="border-r bg-background/98 backdrop-blur-md supports-[backdrop-filter]:bg-background/95 z-40 shadow-sm">
          <SidebarHeader className="border-b border-border/50 p-0">
            <div className="flex items-center justify-between p-4">
              <Link
                href="/"
                className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg p-1 -m-1 transition-all duration-200 hover:bg-accent/50"
              >
                <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 group-hover:border-primary/30 transition-all duration-200">
                  <Image
                    src={V}
                    alt="Vyoma UI Logo"
                    width={32}
                    height={32}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-base group-hover:text-primary transition-colors duration-200">
                    Vyoma UI
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Beautiful components
                  </span>
                </div>
              </Link>
            </div>
            <div className="px-4 pb-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  type="search"
                  placeholder="Search components..."
                  className="w-full pl-10 h-10 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-200"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search components"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-accent/70"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex flex-col flex-1 p-0">
            <ScrollArea className="flex-1">
              <div className="p-3">
                {Object.entries(filteredComponents).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-12 text-center"
                  >
                    <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      No components found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search terms
                    </p>
                  </motion.div>
                ) : (
                  Object.entries(filteredComponents).map(
                    ([category, components], index) => (
                      <Collapsible
                        key={category}
                        open={openCategories[category] === true}
                        onOpenChange={() => toggleCategory(category)}
                        className="group/collapsible mb-3"
                      >
                        <SidebarGroup className="p-0">
                          <CollapsibleTrigger asChild>
                            <SidebarGroupLabel
                              className="group/label text-sm font-semibold hover:bg-accent/60 hover:text-accent-foreground rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between w-full px-3 py-2.5 border border-transparent hover:border-border/50"
                              aria-label={`${category} category`}
                            >
                              <span className="text-foreground">
                                {category}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-medium bg-muted/70 text-muted-foreground border-0 px-2 py-0.5"
                                >
                                  {components.length}
                                </Badge>
                                <ChevronRight className="size-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground group-hover/label:text-foreground" />
                              </div>
                            </SidebarGroupLabel>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="overflow-hidden">
                            <motion.div
                              {...animations.collapsibleContent}
                              className="space-y-1 pt-1"
                            >
                              <SidebarGroupContent>
                                <SidebarMenu className="gap-1">
                                  {components.map((comp) => (
                                    <SidebarMenuItem key={comp.route}>
                                      <SidebarMenuItemComponent comp={comp} />
                                    </SidebarMenuItem>
                                  ))}
                                </SidebarMenu>
                              </SidebarGroupContent>
                            </motion.div>
                          </CollapsibleContent>
                        </SidebarGroup>

                        {index <
                          Object.entries(filteredComponents).length - 1 && (
                          <Separator className="my-3 bg-border/50" />
                        )}
                      </Collapsible>
                    )
                  )
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border/50 p-4 bg-background/50">
              <Link
                href="https://github.com/Srijan-Baniyal/vyoma-ui"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg p-3 hover:bg-accent/60 border border-transparent hover:border-border/50"
              >
                <span className="font-medium">GitHub Repository</span>
                <ExternalLink className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </SidebarContent>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/98 backdrop-blur-md supports-[backdrop-filter]:bg-background/95 px-4 shadow-sm">
            <SidebarTrigger className="md:hidden mr-2 h-9 w-9" />
            <SidebarTrigger className="-ml-1 hidden md:flex hover:bg-accent/70 transition-colors duration-200" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 hidden md:block bg-border/50"
            />
            <BreadcrumbNavigation />
            <div className="ml-auto flex items-center gap-2">
              {/* More things will come here */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleThemeToggle}
                className="h-9 w-9 hover:bg-accent/70 transition-all duration-200 relative overflow-hidden"
                aria-label="Toggle theme"
              >
                <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </header>

          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-6 w-full">
              <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div key={pathname} {...animations.pageTransition}>
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
