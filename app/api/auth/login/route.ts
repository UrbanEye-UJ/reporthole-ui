import { NextResponse, type NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

/** Matches the backend JWT's expiry (`web.jwt.expiration: 86400000` ms, see application.yaml). */
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24;

/**
 * Proxies `POST /auth/login`, then converts the token in the backend's response body into an
 * `HttpOnly`, `Secure` cookie instead of handing it to client JS. `role`/`userId` stay as
 * ordinary cookies — the UI reads those directly — plus a `reporthole_token_exp` cookie (the
 * expiry as a Unix timestamp) so {@link SessionExpiryWarning} can still show a countdown without
 * ever touching the token itself.
 */
export async function POST(request: NextRequest) {
    const body = await request.text();

    const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    const payload = await backendResponse.json().catch(() => null);
    const token: string | undefined = payload?.data?.token;

    // Never echo the token back in the JSON body — it only ever leaves this server as the
    // HttpOnly cookie below, so client JS (including an injected script, in the event of an
    // unrelated XSS bug) never has it to read.
    if (payload?.data && "token" in payload.data) {
        delete payload.data.token;
    }

    const response = NextResponse.json(payload, { status: backendResponse.status });

    if (backendResponse.ok && token) {
        const role: string = payload?.data?.role ?? "";
        const userId: string = payload?.data?.userId ?? "";
        const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS;

        response.cookies.set("reporthole_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: TOKEN_MAX_AGE_SECONDS,
        });
        response.cookies.set("reporthole_role", role, {
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: TOKEN_MAX_AGE_SECONDS,
        });
        response.cookies.set("reporthole_user_id", userId, {
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: TOKEN_MAX_AGE_SECONDS,
        });
        response.cookies.set("reporthole_token_exp", String(expiresAt), {
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: TOKEN_MAX_AGE_SECONDS,
        });
    }

    return response;
}
