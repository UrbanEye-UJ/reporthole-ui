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
            const backendResponse = await fetch(`${BACKEND_URL}/auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`[BFF-LOGOUT] POST /auth/logout -> ${backendResponse.status}`);
        } catch (err) {
            // Best-effort — see doc comment above. Still logged so a dead backend link shows up.
            console.error("[BFF-LOGOUT] backend call failed", err);
        }
    } else {
        console.log("[BFF-LOGOUT] no reporthole_token cookie present — clearing cookies only");
    }

    const response = NextResponse.json({ success: true });
    for (const name of SESSION_COOKIES) {
        response.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
    return response;
}
