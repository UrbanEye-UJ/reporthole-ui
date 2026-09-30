import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

/** Backend always writes uploaded incident images as `<uuid>.jpg` (see LocalImageStorageServiceImpl). */
const SAFE_FILENAME = /^[a-zA-Z0-9-]+\.jpg$/;

/**
 * Streams an incident image through the Next.js server instead of letting the browser hit the
 * stored `imageUrl` directly. That URL is built server-side by the backend from either
 * `SERVICES_WEB_BASE_URL` or an auto-detected local/Docker IP (see
 * `LocalImageStorageServiceImpl.resolveBaseUrl`) — in Docker dev that address is only reachable
 * from other containers on the same network, never from the browser on the host.
 *
 * Only the filename is trusted from the incoming `url` param (mirrors the backend's own
 * `readImage`, which does the same) — the request is always re-issued against `BACKEND_URL`, so a
 * caller can't redirect this server-side fetch at an arbitrary host.
 */
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    let filename: string;
    try {
        filename = new URL(url).pathname.split("/").pop() ?? "";
    } catch {
        return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 });
    }

    if (!SAFE_FILENAME.test(filename)) {
        return NextResponse.json({ error: "Invalid image filename" }, { status: 400 });
    }

    const backendResponse = await fetch(`${BACKEND_URL}/uploads/incidents/${filename}`);

    if (!backendResponse.ok) {
        return NextResponse.json({ error: "Image not found" }, { status: backendResponse.status });
    }

    return new Response(backendResponse.body, {
        status: 200,
        headers: {
            "Content-Type": backendResponse.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control": "private, max-age=3600",
        },
    });
}
