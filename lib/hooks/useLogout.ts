"use client";

import { useRouter } from "next/navigation";

import { clearSessionCookies } from "@/lib/session";

/**
 * Signs the current user out: invalidates the session server-side and clears every session
 * cookie — including the HttpOnly token, which only a server response can clear — via
 * POST /api/auth/logout (see app/api/auth/logout/route.ts), then redirects to /login.
 *
 * Also clears localStorage — this is a shared device concern (device tokens, cached theme
 * preference) as much as a per-user one, so the next person to sign in on this browser doesn't
 * inherit the previous user's local state.
 */
export const useLogout = () => {
  const router = useRouter();

  return async () => {
    await clearSessionCookies();
    localStorage.clear();
    router.push("/login");
  };
};
