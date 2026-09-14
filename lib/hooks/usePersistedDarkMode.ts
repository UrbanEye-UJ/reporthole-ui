"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(storageKey: string, onChange: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === storageKey) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function readDarkMode(storageKey: string, defaultDark: boolean): boolean {
  const saved = localStorage.getItem(storageKey);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return defaultDark;
}

/**
 * Persisted light/dark preference for the Tailwind-based surfaces (civilian,
 * contractor, landing) — the boolean-flavored counterpart to the MUI-role
 * `useThemeMode` hook in `app/(admin)/_components/styles/useThemeMode.ts`.
 *
 * Built on `useSyncExternalStore` rather than `useState` + an effect:
 * `getServerSnapshot` always returns `defaultDark`, so the server-rendered
 * HTML and the client's first hydration pass agree exactly — no hydration
 * mismatch, no flash-then-correct render. Once mounted, React reads the real
 * saved value via `getSnapshot`, and stays in sync across tabs.
 */
export function usePersistedDarkMode(storageKey: string, defaultDark = false) {
  const darkMode = useSyncExternalStore(
    (onChange) => subscribe(storageKey, onChange),
    () => readDarkMode(storageKey, defaultDark),
    () => defaultDark
  );

  const setDarkMode = useCallback(
    (next: boolean) => {
      const value = next ? "dark" : "light";
      localStorage.setItem(storageKey, value);
      // Native "storage" events only fire in *other* tabs — dispatch one here too
      // so this tab's own toggle re-renders immediately via useSyncExternalStore.
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey, newValue: value }));
    },
    [storageKey]
  );

  const toggle = useCallback(() => setDarkMode(!darkMode), [darkMode, setDarkMode]);

  return { darkMode, setDarkMode, toggle };
}
