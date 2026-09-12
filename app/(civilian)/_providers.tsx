"use client";

import type { ReactNode } from "react";
import { SerwistProvider } from "@serwist/next/react";
import {
  CivilianThemeProvider,
  useCivilianTheme,
} from "./_context/CivilianThemeContext";

/** Applies the .dark class to the subtree when dark mode is active. */
function DarkWrapper({ children }: { children: ReactNode }) {
  const { darkMode } = useCivilianTheme();
  return <div className={darkMode ? "dark" : ""}>{children}</div>;
}

export default function CivilianProviders({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV !== "production"}>
      <CivilianThemeProvider>
        <DarkWrapper>{children}</DarkWrapper>
      </CivilianThemeProvider>
    </SerwistProvider>
  );
}
