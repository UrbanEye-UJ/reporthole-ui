/**
 * Clears the session — `reporthole_token` is `HttpOnly` now, so client JS can no longer clear it
 * with `document.cookie`; only a server response's `Set-Cookie` can. Best-effort: a network
 * failure here just leaves the cookies until they expire on their own, which is no worse than
 * the client being unable to act on them anyway.
 */
export async function clearSessionCookies(): Promise<void> {
    try {
        await fetch("/api/auth/logout", { method: "POST" });
    } catch {
        // best-effort — see doc comment above
    }
}
