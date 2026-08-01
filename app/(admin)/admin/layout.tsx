"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material";
// No <CssBaseline /> — dark body styles live on AdminShell's wrapper Box instead of <body>,
// so they don't leak into the civilian UI on SPA navigation.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import type { ReactNode } from "react";

import { createAdminTheme } from "../_components/styles/theme";
import { AdminThemeContext } from "../_components/styles/AdminThemeContext";
import type { AdminThemeMode } from "../_components/styles/AdminThemeContext";
import AdminShell from "../_components/layout/AdminShell";

import "../_components/styles/globals.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  const [mode, setMode] = useState<AdminThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("admin-theme") as AdminThemeMode | null;
    return saved === "dark" || saved === "light" ? saved : "dark";
  });

  const toggle = () => {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("admin-theme", next);
      return next;
    });
  };

  const theme = useMemo(() => createAdminTheme(mode), [mode]);

  return (
    <AdminThemeContext.Provider value={{ mode, toggle }}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <AdminShell>{children}</AdminShell>
          </QueryClientProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </AdminThemeContext.Provider>
  );
}
