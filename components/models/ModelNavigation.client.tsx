"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
  NavbarLogo,
} from "@/components/ui/ResizeAbleNavbar";

const navItems = [
  { name: "Catalogue", link: "/models/" },
  { name: "Compare", link: "/compare/" },
  { name: "Docs", link: "https://docs.llm7.io/quickstart" },
  { name: "Dashboard", link: "https://dash.llm7.io" },
];

export default function ModelNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <Navbar className="mb-2">
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <ThemeToggle />
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNavToggle isOpen={open} onClick={() => setOpen((value) => !value)} />
          </div>
        </MobileNavHeader>
        <MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              onClick={() => setOpen(false)}
              target={item.link.startsWith("http") ? "_blank" : undefined}
              rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex min-h-12 w-full items-center rounded-lg px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
