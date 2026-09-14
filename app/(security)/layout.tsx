"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createAdminTheme } from "@/app/(admin)/_components/styles/theme";
import { useThemeMode } from "@/app/(admin)/_components/styles/useThemeMode";
import SecurityShell from "./_components/SecurityShell";
/**
 * Route-group layout for `/security/**` — the surface reserved for the
 * `SECURITY_ADMIN` role (role grants, account suspension, forced logout, and the
 * access-control audit trail). `proxy.ts` keeps every other role out of this
 * prefix; the backend enforces the same rule on every endpoint.
 *
 * Shares the admin theme (`createAdminTheme`) for visual consistency, and
 * persists its own light/dark preference under the "security-theme"
 * localStorage key via the same `useThemeMode` hook the admin layout uses —
 * kept as its own QueryClient/shell since this surface is otherwise lean.
 */
export default function SecurityLayout({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 1000 * 60, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      })
  );

  const { mode, toggle: toggleMode } = useThemeMode("security-theme", "light");
  const theme = useMemo(() => createAdminTheme(mode), [mode]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <SecurityShell mode={mode} toggleMode={toggleMode}>{children}</SecurityShell>
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
