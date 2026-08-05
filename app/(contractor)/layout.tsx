"use client";

import type { ReactNode } from "react";
import {
  ContractorThemeProvider,
  useContractorTheme,
} from "./_context/ContractorThemeContext";

/** Applies the .dark class to the subtree when dark mode is active. */
function DarkWrapper({ children }: { children: ReactNode }) {
  const { darkMode } = useContractorTheme();
  return <div className={darkMode ? "dark" : ""}>{children}</div>;
}

export default function ContractorLayout({ children }: { children: ReactNode }) {
  return (
    <ContractorThemeProvider>
      <DarkWrapper>{children}</DarkWrapper>
    </ContractorThemeProvider>
  );
}
