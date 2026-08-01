"use client";

import { createContext, useContext } from "react";

export type AdminThemeMode = "dark" | "light";

export interface AdminThemeContextValue {
  mode: AdminThemeMode;
  toggle: () => void;
}

export const AdminThemeContext = createContext<AdminThemeContextValue>({
  mode: "dark",
  toggle: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);
