"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Snippet } from "@/components/Snippet";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/ui/Icons";
import {
  usePackageManager,
  PackageManagerType,
} from "@/contexts/PackageManagerContext";

interface PackageManagerTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  command: string;
  color: string;
  description?: string;
}

interface PackageManagerTabsProps {
  command: string;
  className?: string;
}

const getYarnCommand = (command: string) => {
  if (command.startsWith("create-next-app")) {
    return command.replace("create-next-app@latest", "create next-app");
  }
  return command;
};

const getPnpmCommand = (command: string) => {
  if (command.startsWith("create-next-app")) {
    return command.replace("create-next-app@latest", "create next-app");
  }
  return `dlx ${command}`;
};

const getBunCommand = (command: string) => {
  if (command.startsWith("create-next-app")) {
    return command.replace("create-next-app@latest", "create next-app");
  }
  return command;
};

const packageManagers: PackageManagerTab[] = [
  {
    id: "npm",
    name: "npm",
    icon: <Icons.npm className="w-4 h-4" />,
    command: "npx",
    color: "from-red-500 to-red-600",
    description: "Node Package Manager",
  },
  {
    id: "yarn",
    name: "Yarn",
    icon: <Icons.yarn className="w-4 h-4" />,
    command: "yarn",
    color: "from-blue-500 to-blue-600",
    description: "v1.22.22 (no dlx)",
  },
  {
    id: "pnpm",
    name: "pnpm",
    icon: <Icons.pnpm className="w-4 h-4" />,
    command: "pnpm",
    color: "from-orange-500 to-orange-600",
    description: "Efficient & Fast",
  },
  {
    id: "bun",
    name: "Bun",
    icon: <Icons.bun className="w-4 h-4" />,
    command: "bunx",
    color: "from-yellow-500 to-yellow-600",
    description: "Lightning Fast",
  },
];

export function PackageManagerTabs({
  command,
  className = "",
}: PackageManagerTabsProps) {
  const { selectedManager, setSelectedManager } = usePackageManager();
  const [activeTab, setActiveTab] =
    useState<PackageManagerType>(selectedManager);

  // Sync with global state
  useEffect(() => {
    setActiveTab(selectedManager);
  }, [selectedManager]);

  const activeManager =
    packageManagers.find((pm) => pm.id === activeTab) || packageManagers[0];

  const getFullCommand = () => {
    switch (activeManager.id) {
      case "yarn":
        if (command.startsWith("create-next-app")) {
          return `yarn ${getYarnCommand(command)}`;
        } else {
          // For non-create commands, show npx separately since yarn v1 doesn't support dlx
          return `npx ${command}`;
        }
      case "pnpm":
        return `pnpm ${getPnpmCommand(command)}`;
      case "bun":
        return `bunx ${getBunCommand(command)}`;
      default:
        return `${activeManager.command} ${command}`;
    }
  };

  const fullCommand = getFullCommand();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-xl border backdrop-blur-sm">
        {packageManagers.map((pm) => (
          <button
            key={pm.id}
            onClick={() => {
              setActiveTab(pm.id as PackageManagerType);
              setSelectedManager(pm.id as PackageManagerType);
            }}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
              activeTab === pm.id
                ? "text-white shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            {/* Active tab background */}
            {activeTab === pm.id && (
              <motion.div
                layoutId="activeTab"
                className={`absolute inset-0 bg-gradient-to-r ${pm.color} rounded-lg`}
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}

            {/* Tab content */}
            <div className="relative z-10 flex items-center gap-2">
              <div
                className={`transition-transform duration-300 ${
                  activeTab === pm.id ? "scale-110" : ""
                }`}
              >
                {pm.icon}
              </div>
              <span className="hidden sm:inline">{pm.name}</span>
            </div>

            {/* Hover glow effect */}
            {activeTab !== pm.id && (
              <div
                className={`absolute inset-0 bg-gradient-to-r ${pm.color} opacity-0 hover:opacity-10 rounded-lg transition-opacity duration-300`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Command Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            {/* Animated gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${activeManager.color} opacity-5`}
            />
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${activeManager.color}`}
            />

            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${activeManager.color} text-white shadow-lg`}
                >
                  {activeManager.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {activeManager.name}
                  </h3>
                  {activeManager.description && (
                    <p className="text-sm text-muted-foreground">
                      {activeManager.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Yarn v1 Disclaimer */}
              {activeManager.id === "yarn" && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mt-0.5">
                      <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">
                        !
                      </span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Using Yarn v1.22.22
                      </p>
                      <p className="text-amber-700 dark:text-amber-300">
                        This version does not support{" "}
                        <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">
                          dlx
                        </code>
                        . For tools like shadcn, please run the{" "}
                        <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">
                          npx
                        </code>{" "}
                        command separately.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Snippet text={fullCommand} />
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
