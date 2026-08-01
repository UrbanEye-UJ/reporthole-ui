"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface CivilianThemeContextValue {
  darkMode: boolean;
  toggle: () => void;
}

const CivilianThemeContext = createContext<CivilianThemeContextValue>({
  darkMode: false,
  toggle: () => {},
});

export function CivilianThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("civilian-theme") === "dark";
  });

  const toggle = () => {
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem("civilian-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <CivilianThemeContext.Provider value={{ darkMode, toggle }}>
      {children}
    </CivilianThemeContext.Provider>
  );
}

export const useCivilianTheme = () => useContext(CivilianThemeContext);
