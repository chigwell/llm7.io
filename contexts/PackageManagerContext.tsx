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
    const saved = localStorage.getItem("selected-package-manager");
    if (saved && ["npm", "yarn", "pnpm", "bun"].includes(saved)) {
      setSelectedManager(saved as PackageManagerType);
    }
  }, []);

  const handleSetSelectedManager = (manager: PackageManagerType) => {
    setSelectedManager(manager);
    localStorage.setItem("selected-package-manager", manager);
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
