import { NextRequest } from "next/server";

const BE_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api").replace(/\/api$/, "");

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    const upstream = await fetch(`${BE_BASE}/api/incidents/events`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
        },
    });

    if (!upstream.ok || !upstream.body) {
        return new Response("Failed to connect to event stream", { status: 502 });
    }

    return new Response(upstream.body, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
