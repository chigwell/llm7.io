"use client";

import type * as React from "react";
import Link from "next/link";
import { useState } from "react";
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  BookOpenIcon,
  CodeIcon,
  PaletteIcon,
  RocketIcon,
  SparklesIcon,
  GithubIcon,
  TwitterIcon,
  MessageCircleIcon,
  HeartIcon,
  MenuIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/buttonShadcn";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const components = [
  {
    title: "Button",
    href: "/components/button",
    description: "Displays a button or a component that looks like a button.",
    icon: (
      <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded shadow-sm" />
    ),
  },
  {
    title: "Card",
    href: "/components/card",
    description: "Displays a card with header, content, and footer.",
    icon: (
      <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded shadow-sm" />
    ),
  },
  {
    title: "Dialog",
    href: "/components/dialog",
    description:
      "A window overlaid on either the primary window or another dialog window.",
    icon: (
      <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded shadow-sm" />
    ),
  },
  {
    title: "Input",
    href: "/components/input",
    description:
      "Displays a form input field or a component that looks like an input field.",
    icon: (
      <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded shadow-sm" />
    ),
  },
  {
    title: "Progress",
    href: "/components/progress",
    description:
      "Displays an indicator showing the completion progress of a task.",
    icon: (
      <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded shadow-sm" />
    ),
  },
  {
    title: "Tooltip",
    href: "/components/tooltip",
    description:
      "A popup that displays information related to an element when hovered.",
    icon: (
      <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-sm" />
    ),
  },
];

const resources = [
  {
    title: "Documentation",
    href: "/docs",
    description: "Complete guide to using our component library",
    icon: <BookOpenIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
  },
  {
    title: "Components",
    href: "/components",
    description: "Browse all available components and examples",
    icon: <CodeIcon className="h-4 w-4 text-green-600 dark:text-green-400" />,
  },
  {
    title: "Themes",
    href: "/themes",
    description: "Customize the look and feel of your components",
    icon: (
      <PaletteIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
    ),
  },
  {
    title: "Getting Started",
    href: "/getting-started",
    description: "Quick start guide and installation instructions",
    icon: (
      <RocketIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
    ),
  },
];

const statusItems = [
  {
    title: "Planning",
    description: "Ideas and concepts in development",
    icon: (
      <CircleHelpIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
    ),
    count: "12",
  },
  {
    title: "In Progress",
    description: "Currently being developed",
    icon: <CircleIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
    count: "8",
  },
  {
    title: "Completed",
    description: "Ready to use components",
    icon: (
      <CircleCheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
    ),
    count: "24",
  },
];

const community = [
  {
    title: "GitHub",
    href: "https://github.com",
    description: "Star us on GitHub and contribute",
    icon: <GithubIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />,
    external: true,
  },
  {
    title: "Twitter",
    href: "https://twitter.com",
    description: "Follow us for updates and news",
    icon: <TwitterIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />,
    external: true,
  },
  {
    title: "Discord",
    href: "https://discord.com",
    description: "Join our community discussions",
    icon: (
      <MessageCircleIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
    ),
    external: true,
  },
];

function ListItem({
  title,
  children,
  href,
  icon,
  external = false,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}) {
  return (
    <li {...props}>
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-md focus:bg-accent focus:text-accent-foreground focus:shadow-md border border-transparent hover:border-border/50"
      >
        <div className="flex items-center gap-3">
          <div className="transition-transform duration-200 group-hover:scale-110">
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold leading-none tracking-tight">
              {title}
            </span>
            {external && <ExternalLinkIcon className="h-3 w-3 opacity-50" />}
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-foreground/80 transition-colors duration-200">
          {children}
        </p>
      </Link>
    </li>
  );
}

function StatusItem({
  title,
  description,
  icon,
  count,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: string;
}) {
  return (
    <li {...props}>
      <Link
        href="#"
        className="group flex items-center gap-3 rounded-lg p-4 transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-md border border-transparent hover:border-border/50"
      >
        <div className="transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">
              {title}
            </span>
            <Badge variant="secondary" className="text-xs">
              {count}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-200">
            {description}
          </div>
        </div>
      </Link>
    </li>
  );
}

function MobileNavItem({
  title,
  items,
  icon,
}: {
  title: string;
  items: {
    title: string;
    href: string;
    description: string;
    icon: React.ReactNode;
    external?: boolean;
    count?: string;
  }[];
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
        <div className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 px-4 pb-2">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-3 rounded-md px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {item.icon}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.title}</span>
                {item.external && (
                  <ExternalLinkIcon className="h-3 w-3 opacity-50" />
                )}
                {item.count && (
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            </div>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function NavigationShowcase() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background justify-center items-center flex">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground transition-transform duration-200 group-hover:scale-105">
                <SparklesIcon className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">VyomaUI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex">
              <NavigationMenu viewport={false}>
                <NavigationMenuList className="gap-1">
                  {/* Home */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium">
                      Home
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-3">
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              VyomaUI
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Beautiful components for modern web
                              applications. Built with React, TypeScript, and
                              Tailwind CSS.
                            </p>
                          </Link>
                        </li>
                        <ListItem
                          href="/docs"
                          title="Introduction"
                          icon={
                            <BookOpenIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          }
                        >
                          Get started with our component library
                        </ListItem>
                        <ListItem
                          href="/docs/installation"
                          title="Installation"
                          icon={
                            <RocketIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                          }
                        >
                          Quick setup and installation guide
                        </ListItem>
                        <ListItem
                          href="/docs/examples"
                          title="Examples"
                          icon={
                            <CodeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          }
                        >
                          Real-world examples and use cases
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Components */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium">
                      Components
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-6 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {components.map((component) => (
                          <ListItem
                            key={component.title}
                            title={component.title}
                            href={component.href}
                            icon={component.icon}
                          >
                            {component.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Resources */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium">
                      Resources
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-3 p-6">
                        {resources.map((resource) => (
                          <ListItem
                            key={resource.title}
                            title={resource.title}
                            href={resource.href}
                            icon={resource.icon}
                          >
                            {resource.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Status */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium">
                      Status
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[280px] gap-2 p-6">
                        {statusItems.map((item) => (
                          <StatusItem
                            key={item.title}
                            title={item.title}
                            description={item.description}
                            icon={item.icon}
                            count={item.count}
                          />
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Community */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium">
                      Community
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[260px] gap-3 p-6">
                        {community.map((item) => (
                          <ListItem
                            key={item.title}
                            title={item.title}
                            href={item.href}
                            icon={item.icon}
                            external={item.external}
                          >
                            {item.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Documentation Link */}
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/docs" className={navigationMenuTriggerStyle()}>
                        Documentation
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/docs">Get Started</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/support">
                  <HeartIcon className="mr-2 h-4 w-4" />
                  Support Us
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      <SparklesIcon className="h-3 w-3" />
                    </div>
                    VyomaUI
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <MobileNavItem
                    title="Home"
                    icon={<SparklesIcon className="h-4 w-4" />}
                    items={[
                      {
                        title: "Introduction",
                        href: "/docs",
                        description: "Get started with our component library",
                        icon: (
                          <BookOpenIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ),
                      },
                      {
                        title: "Installation",
                        href: "/docs/installation",
                        description: "Quick setup guide",
                        icon: (
                          <RocketIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ),
                      },
                      {
                        title: "Examples",
                        href: "/docs/examples",
                        description: "Real-world examples",
                        icon: (
                          <CodeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        ),
                      },
                    ]}
                  />
                  <MobileNavItem
                    title="Components"
                    icon={<CodeIcon className="h-4 w-4" />}
                    items={components}
                  />
                  <MobileNavItem
                    title="Resources"
                    icon={<BookOpenIcon className="h-4 w-4" />}
                    items={resources}
                  />
                  <MobileNavItem
                    title="Status"
                    icon={<CircleCheckIcon className="h-4 w-4" />}
                    items={statusItems.map((item) => ({
                      ...item,
                      href: "#",
                    }))}
                  />
                  <MobileNavItem
                    title="Community"
                    icon={<MessageCircleIcon className="h-4 w-4" />}
                    items={community}
                  />

                  <div className="border-t pt-4">
                    <Link
                      href="/docs"
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpenIcon className="h-4 w-4" />
                      Documentation
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href="/docs"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link
                        href="/support"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <HeartIcon className="mr-2 h-4 w-4" />
                        Support Us
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  );
}