"use client";

import { createContext, useContext, type ReactNode } from "react";

import { usePersistedDarkMode } from "@/lib/hooks/usePersistedDarkMode";

interface CivilianThemeContextValue {
  darkMode: boolean;
  toggle: () => void;
}

const CivilianThemeContext = createContext<CivilianThemeContextValue>({
  darkMode: false,
  toggle: () => {},
});

export function CivilianThemeProvider({ children }: { children: ReactNode }) {
  const { darkMode, toggle } = usePersistedDarkMode("civilian-theme");

  return (
    <CivilianThemeContext.Provider value={{ darkMode, toggle }}>
      {children}
    </CivilianThemeContext.Provider>
  );
}

export const useCivilianTheme = () => useContext(CivilianThemeContext);
