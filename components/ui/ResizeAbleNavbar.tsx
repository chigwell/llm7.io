"use client";

import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import React, { useRef, useState } from "react";
import Image from "next/image";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      className={cn("sticky inset-x-0 top-5 z-50 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(20px)" : "none",
        boxShadow: visible
          ? "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)"
          : "blur(0px)",
        width: visible ? "50%" : "100%",
        height: visible ? "100%" : "100%",
        y: visible ? 12 : 0,
        scale: visible ? 0.98 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 40,
        mass: 0.8,
      }}
      style={{
        minWidth: "875px",
        maxWidth: "1200px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl items-center px-6 py-3 backdrop-saturate-150 lg:grid lg:grid-cols-3",
        visible
          ? "rounded-2xl border border-border/70 bg-background/85 shadow-[0_8px_32px_rgba(0,0,0,0.12)] supports-[backdrop-filter]:bg-background/75 dark:border-white/10 dark:bg-background/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          : "border-0",
        className
      )}
    >
      <div className="flex justify-start">
        {React.Children.toArray(children)[0]}
      </div>
      <div className="flex justify-center">
        {React.Children.toArray(children)[1]}
      </div>
      <div className="flex justify-end">
        {React.Children.toArray(children)[2]}
      </div>
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "hidden flex-row items-center justify-center space-x-1 text-sm font-medium lg:flex",
        className
      )}
    >
      {items.map((item, idx) => (
        <motion.a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2.5 text-foreground/80 transition-colors duration-200 hover:text-foreground"
          key={`link-${idx}`}
          href={item.link}
          target={item.link.startsWith("http") ? "_blank" : undefined}
          rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-xl bg-accent/80 backdrop-blur-sm dark:bg-white/10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            />
          )}
          <span className="relative z-20 font-medium">{item.name}</span>
        </motion.a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(20px)" : "none",
        boxShadow: visible
          ? "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)"
          : "none",
        width: visible ? "95%" : "100%",
        height: visible ? "100%" : "100%",
        paddingRight: visible ? "16px" : "12px",
        paddingLeft: visible ? "16px" : "12px",
        borderRadius: visible ? "16px" : "0px",
        y: visible ? 16 : 0,
        scale: visible ? 0.98 : 0.98,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 40,
        mass: 0.8,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-1rem)] flex-col items-center justify-between py-3 backdrop-saturate-150 lg:hidden",
        visible
          ? "border border-border/70 bg-background/85 shadow-[0_8px_32px_rgba(0,0,0,0.12)] supports-[backdrop-filter]:bg-background/75 dark:border-white/10 dark:bg-background/75 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          : "border-0",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between px-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence mode="sync">
      {isOpen && (
        <motion.div
          animate={{
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)",
            width: "95%",
            height: "100%",
            paddingRight: "16px",
            paddingLeft: "12px",
            borderRadius: "16px",
            scale: 0.98,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 40,
            mass: 0.8,
          }}
          className={cn(
            "relative z-50 mx-auto flex w-full max-w-[calc(100vw-1rem)] flex-col items-center justify-between gap-2 py-4 backdrop-saturate-150 lg:hidden",
            "border border-border/70 bg-background/90 shadow-[0_8px_32px_rgba(0,0,0,0.12)] supports-[backdrop-filter]:bg-background/80 dark:border-white/10 dark:bg-background/85 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10"
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.1 }}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <IconX className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <IconMenu2 className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export const NavbarLogo = () => {
  return (
    <motion.a
      href="/"
      className="relative z-20 flex items-center space-x-3 px-2 py-1 text-sm font-normal"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="flex items-center justify-center"
        whileHover={{ rotate: 5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="h-10 w-10 rounded-lg flex items-center justify-center shadow-lg">
          <Image
            src="/llm7.png"
            alt="LLM7.io"
            width={40}
            height={40}
            priority
            quality={100}
          />
        </div>
      </motion.div>
      <span className="text-lg font-semibold text-neutral-800 dark:text-white">
        LLM7.io
      </span>
    </motion.a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient" | "glass";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-xl text-sm font-semibold relative cursor-pointer transition-all duration-200 inline-flex items-center justify-center backdrop-blur-sm";

  const variantStyles = {
    primary:
      "bg-white/90 text-neutral-900 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 border border-white/20 dark:bg-white/10 dark:text-white dark:border-white/10",
    secondary:
      "bg-white/10 text-neutral-700 hover:bg-white/20 dark:text-neutral-300 dark:hover:bg-white/10 border border-white/20 dark:border-white/10",
    dark: "bg-black/80 text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 border border-black/20 dark:border-white/10",
    gradient:
      "bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 border border-blue-400/20",
    glass:
      "bg-white/10 text-neutral-700 dark:text-neutral-300 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Tag
        href={href || undefined}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </Tag>
    </motion.div>
  );
};
