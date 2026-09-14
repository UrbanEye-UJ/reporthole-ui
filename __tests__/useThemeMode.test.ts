import { renderHook, act } from "@testing-library/react";

import { useThemeMode } from "@/app/(admin)/_components/styles/useThemeMode";

describe("useThemeMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("falls back to the given default when nothing is stored", () => {
    const { result } = renderHook(() => useThemeMode("admin-theme", "light"));
    expect(result.current.mode).toBe("light");
  });

  it("picks up a previously saved value on mount", () => {
    localStorage.setItem("admin-theme", "dark");
    const { result } = renderHook(() => useThemeMode("admin-theme", "light"));
    expect(result.current.mode).toBe("dark");
  });

  it("ignores a garbage stored value and falls back to the default", () => {
    localStorage.setItem("admin-theme", "solarized");
    const { result } = renderHook(() => useThemeMode("admin-theme", "light"));
    expect(result.current.mode).toBe("light");
  });

  it("toggle() flips the mode and persists it under the given key", () => {
    const { result } = renderHook(() => useThemeMode("admin-theme", "light"));

    act(() => result.current.toggle());
    expect(result.current.mode).toBe("dark");
    expect(localStorage.getItem("admin-theme")).toBe("dark");

    act(() => result.current.toggle());
    expect(result.current.mode).toBe("light");
    expect(localStorage.getItem("admin-theme")).toBe("light");
  });

  it("setMode() sets and persists an explicit value", () => {
    const { result } = renderHook(() => useThemeMode("admin-theme", "light"));

    act(() => result.current.setMode("dark"));
    expect(result.current.mode).toBe("dark");
    expect(localStorage.getItem("admin-theme")).toBe("dark");
  });

  it("keeps admin and security-admin preferences independent — this was the original bug: the security layout used no key at all and never persisted", () => {
    const admin = renderHook(() => useThemeMode("admin-theme", "light"));
    const security = renderHook(() => useThemeMode("security-theme", "light"));

    act(() => admin.result.current.toggle());

    expect(admin.result.current.mode).toBe("dark");
    expect(security.result.current.mode).toBe("light");
    expect(localStorage.getItem("admin-theme")).toBe("dark");
    expect(localStorage.getItem("security-theme")).toBeNull();
  });

  it("syncs two components sharing the same key without a page reload", () => {
    const first = renderHook(() => useThemeMode("admin-theme", "light"));
    const second = renderHook(() => useThemeMode("admin-theme", "light"));

    act(() => first.result.current.toggle());

    expect(first.result.current.mode).toBe("dark");
    expect(second.result.current.mode).toBe("dark");
  });
});
