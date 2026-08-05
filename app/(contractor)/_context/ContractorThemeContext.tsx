"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface ContractorThemeContextValue {
  darkMode: boolean;
  toggle: () => void;
}

const ContractorThemeContext = createContext<ContractorThemeContextValue>({
  darkMode: false,
  toggle: () => {},
});

export function ContractorThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("contractor-theme") === "dark";
  });

  const toggle = () => {
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem("contractor-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <ContractorThemeContext.Provider value={{ darkMode, toggle }}>
      {children}
    </ContractorThemeContext.Provider>
  );
}

export const useContractorTheme = () => useContext(ContractorThemeContext);
