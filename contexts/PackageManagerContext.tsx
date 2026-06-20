"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PackageManagerType = "npm" | "yarn" | "pnpm" | "bun";

interface PackageManagerContextType {
  selectedManager: PackageManagerType;
  setSelectedManager: (manager: PackageManagerType) => void;
}

const PackageManagerContext = createContext<
  PackageManagerContextType | undefined
>(undefined);

export function PackageManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedManager, setSelectedManager] =
    useState<PackageManagerType>("npm");

  // Persist selection in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("selected-package-manager");
      if (saved && ["npm", "yarn", "pnpm", "bun"].includes(saved)) {
        setSelectedManager(saved as PackageManagerType);
      }
    } catch (_err) {
      // Ignore blocked storage and keep the default manager.
    }
  }, []);

  const handleSetSelectedManager = (manager: PackageManagerType) => {
    setSelectedManager(manager);
    try {
      localStorage.setItem("selected-package-manager", manager);
    } catch (_err) {
      // Ignore blocked storage; the in-memory selection still updates.
    }
  };

  return (
    <PackageManagerContext.Provider
      value={{
        selectedManager,
        setSelectedManager: handleSetSelectedManager,
      }}
    >
      {children}
    </PackageManagerContext.Provider>
  );
}

export function usePackageManager() {
  const context = useContext(PackageManagerContext);
  if (context === undefined) {
    throw new Error(
      "usePackageManager must be used within a PackageManagerProvider"
    );
  }
  return context;
}
