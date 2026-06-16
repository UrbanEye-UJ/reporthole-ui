import { NextRequest, NextResponse } from "next/server";

function resolveInternalUrl(url: string): string {
    const internalBase = process.env.INTERNAL_API_URL;
    if (!internalBase) return url;
    try {
        const parsed = new URL(url);
        const internal = new URL(internalBase);
        parsed.hostname = internal.hostname;
        parsed.port = internal.port;
        parsed.protocol = internal.protocol;
        return parsed.toString();
    } catch {
        return url;
    }
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) return new NextResponse("Missing url", { status: 400 });

    const fetchUrl = resolveInternalUrl(url);
    const response = await fetch(fetchUrl);
    if (!response.ok) return new NextResponse("Failed to fetch image", { status: response.status });

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") ?? "image/jpeg";

    return new NextResponse(buffer, {
        headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000" },
    });
}
