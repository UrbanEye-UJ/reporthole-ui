import { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

/**
 * Generic `/api/**` proxy to the Spring Boot backend, taking over from the plain
 * `next.config.ts` rewrite for every path that doesn't have a more specific Route Handler
 * (`/api/auth/login`, `/api/auth/logout`).
 *
 * The one thing a plain rewrite can't do is touch headers: `reporthole_token` is an `HttpOnly`
 * cookie (client JS can't read it), so the `Authorization: Bearer` header has to be attached
 * here, server-side, from the cookie on the incoming request. This also finally gives
 * `/api/incidents/events` (SSE) a real `Authorization` header instead of the browser-side
 * `?token=` query-param fallback `EventSource` needed when there was no proxy to do this.
 */
async function proxy(request: NextRequest, path: string[]): Promise<Response> {
    const token = request.cookies.get("reporthole_token")?.value;
    const targetUrl = `${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`;

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("cookie");
    if (token) {
        headers.set("authorization", `Bearer ${token}`);
    }

    const init: RequestInit & { duplex?: "half" } = {
        method: request.method,
        headers,
        redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = request.body;
        init.duplex = "half";
    }

    const backendResponse = await fetch(targetUrl, init);

    console.log(`[BFF-PROXY] ${request.method} /${path.join("/")} -> ${backendResponse.status}`);

    // Hop-by-hop headers that don't survive re-wrapping the body below without mismatching.
    const responseHeaders = new Headers(backendResponse.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("connection");

    return new Response(backendResponse.body, {
        status: backendResponse.status,
        headers: responseHeaders,
    });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
    return proxy(request, (await params).path);
}
export async function POST(request: NextRequest, { params }: RouteContext) {
    return proxy(request, (await params).path);
}
export async function PUT(request: NextRequest, { params }: RouteContext) {
    return proxy(request, (await params).path);
}
export async function PATCH(request: NextRequest, { params }: RouteContext) {
    return proxy(request, (await params).path);
}
export async function DELETE(request: NextRequest, { params }: RouteContext) {
    return proxy(request, (await params).path);
}
