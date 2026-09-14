"use client";

/**
 * Thin theme context for the public landing page.
 * Persists the user's preference to localStorage so it survives navigation.
 */

import { createContext, useContext } from "react";

import { usePersistedDarkMode } from "@/lib/hooks/usePersistedDarkMode";

interface LandingThemeCtx {
  dark: boolean;
  toggle: () => void;
}

const Ctx = createContext<LandingThemeCtx>({ dark: false, toggle: () => {} });

export function LandingThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode: dark, toggle } = usePersistedDarkMode("rh-landing-theme");

  return <Ctx.Provider value={{ dark, toggle }}>{children}</Ctx.Provider>;
}

export const useLandingTheme = () => useContext(Ctx);
