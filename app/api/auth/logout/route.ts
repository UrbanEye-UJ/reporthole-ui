import { NextResponse, type NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

const SESSION_COOKIES = ["reporthole_token", "reporthole_role", "reporthole_user_id", "reporthole_token_exp"];

/**
 * Invalidates the session server-side (bumps `credentialsValidFrom`, see `POST /auth/logout`)
 * and clears every session cookie via the response's `Set-Cookie` headers — the only way to
 * clear `reporthole_token` now that it's `HttpOnly`. The backend call is best-effort, matching
 * the client's previous behaviour: a network hiccup shouldn't leave the browser holding cookies
 * it can no longer use, so they're cleared below regardless of whether it succeeded.
 */
export async function POST(request: NextRequest) {
    const token = request.cookies.get("reporthole_token")?.value;

    if (token) {
        try {
            await fetch(`${BACKEND_URL}/auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            // Best-effort — see doc comment above.
        }
    }

    const response = NextResponse.json({ success: true });
    for (const name of SESSION_COOKIES) {
        response.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
    return response;
}
