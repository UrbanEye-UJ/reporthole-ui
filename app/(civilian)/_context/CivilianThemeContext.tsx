"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("civilian-theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

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
