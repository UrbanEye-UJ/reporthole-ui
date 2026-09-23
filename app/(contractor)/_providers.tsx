"use client";

import type { ReactNode } from "react";
import { SerwistProvider } from "@serwist/next/react";
import {
  ContractorThemeProvider,
  useContractorTheme,
} from "./_context/ContractorThemeContext";
import { useOfflineSync } from "@/lib/hooks/useOfflineSync";
import OfflineQueueBanner from "@/components/shared/OfflineQueueBanner";
/** Applies the .dark class to the subtree when dark mode is active. */
function DarkWrapper({ children }: { children: ReactNode }) {
  const { darkMode } = useContractorTheme();
  return (
    <div className={darkMode ? "dark" : ""}>
      {children}
    </div>
  );
}

export default function ContractorProviders({ children }: { children: ReactNode }) {
  useOfflineSync();
  return (
    <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV !== "production"}>
      <ContractorThemeProvider>
        <DarkWrapper>{children}</DarkWrapper>
      </ContractorThemeProvider>
      <OfflineQueueBanner />
    </SerwistProvider>
  );
}
