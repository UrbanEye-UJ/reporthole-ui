"use client";

/**
 * Thin theme context for the public landing page.
 * Persists the user's preference to localStorage so it survives navigation.
 */

import { createContext, useContext, useEffect, useState } from "react";

interface LandingThemeCtx {
  dark: boolean;
  toggle: () => void;
}

const Ctx = createContext<LandingThemeCtx>({ dark: false, toggle: () => {} });

export function LandingThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("rh-landing-theme") === "dark") setDark(true);
  }, []);

  const toggle = () =>
    setDark((d) => {
      const next = !d;
      localStorage.setItem("rh-landing-theme", next ? "dark" : "light");
      return next;
    });

  return <Ctx.Provider value={{ dark, toggle }}>{children}</Ctx.Provider>;
}

export const useLandingTheme = () => useContext(Ctx);
