"use client";

import type { ReactNode } from "react";
import {
  CivilianThemeProvider,
  useCivilianTheme,
} from "./_context/CivilianThemeContext";

/** Applies the .dark class to the subtree when dark mode is active. */
function DarkWrapper({ children }: { children: ReactNode }) {
  const { darkMode } = useCivilianTheme();
  return <div className={darkMode ? "dark" : ""}>{children}</div>;
}

export default function CivilianLayout({ children }: { children: ReactNode }) {
  return (
    <CivilianThemeProvider>
      <DarkWrapper>{children}</DarkWrapper>
    </CivilianThemeProvider>
  );
}
