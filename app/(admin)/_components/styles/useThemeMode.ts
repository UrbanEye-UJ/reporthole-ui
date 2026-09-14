"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark";

function subscribe(storageKey: string, onChange: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === storageKey) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function readMode(storageKey: string, defaultMode: ThemeMode): ThemeMode {
  const saved = localStorage.getItem(storageKey);
  return saved === "light" || saved === "dark" ? saved : defaultMode;
}

/**
 * Persisted light/dark mode, shared by every MUI surface that uses
 * `createAdminTheme` (admin, security-admin).
 *
 * Backed by `useSyncExternalStore` rather than `useState` + an effect: the
 * `getServerSnapshot` always returns `defaultMode`, so the server-rendered
 * HTML and the client's first hydration pass agree exactly — no hydration
 * mismatch, no flash-then-correct render. Once mounted, React reads the real
 * saved value via `getSnapshot`.
 */
export function useThemeMode(storageKey: string, defaultMode: ThemeMode = "light") {
  const mode = useSyncExternalStore(
    (onChange) => subscribe(storageKey, onChange),
    () => readMode(storageKey, defaultMode),
    () => defaultMode
  );

  const setMode = useCallback(
    (next: ThemeMode) => {
      localStorage.setItem(storageKey, next);
      // Native "storage" events only fire in *other* tabs — dispatch one here too
      // so this tab's own toggle re-renders immediately via useSyncExternalStore.
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey, newValue: next }));
    },
    [storageKey]
  );

  const toggle = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  return { mode, setMode, toggle };
}
