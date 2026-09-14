"use client";

import { useRouter } from "next/navigation";

import { logout as logoutRequest } from "@/app/api/generated/authentication/authentication";

/**
 * Signs the current user out: invalidates the session server-side (so a captured token can't
 * keep being used after "logout" — see POST /auth/logout) before clearing the session cookies
 * and redirecting to /login. The server call is best-effort — a network hiccup shouldn't trap
 * the user on a page they just asked to leave, so cookies are cleared and the redirect happens
 * regardless of whether it succeeds.
 */
export const useLogout = () => {
  const router = useRouter();

  return async () => {
    try {
      await logoutRequest();
    } catch {
      // Best-effort: still clear the local session below even if the server call failed.
    }
    document.cookie = "reporthole_token=; path=/; max-age=0";
    document.cookie = "reporthole_role=; path=/; max-age=0";
    document.cookie = "reporthole_user_id=; path=/; max-age=0";
    router.push("/login");
  };
};
