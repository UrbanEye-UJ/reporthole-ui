"use client";

import { createContext, useContext, type ReactNode } from "react";

import { usePersistedDarkMode } from "@/lib/hooks/usePersistedDarkMode";

interface ContractorThemeContextValue {
  darkMode: boolean;
  toggle: () => void;
}

const ContractorThemeContext = createContext<ContractorThemeContextValue>({
  darkMode: false,
  toggle: () => {},
});

export function ContractorThemeProvider({ children }: { children: ReactNode }) {
  const { darkMode, toggle } = usePersistedDarkMode("contractor-theme");

  return (
    <ContractorThemeContext.Provider value={{ darkMode, toggle }}>
      {children}
    </ContractorThemeContext.Provider>
  );
}

export const useContractorTheme = () => useContext(ContractorThemeContext);
