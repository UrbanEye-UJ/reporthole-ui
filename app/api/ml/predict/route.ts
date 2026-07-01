import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Route Handler that proxies dashcam frame images to the ML inference service.
 *
 * The browser cannot call the ML service directly because it runs inside the Docker
 * network and has no CORS configuration. This handler forwards the image as multipart
 * and returns the raw {@code PredictResponse} JSON to the client.
 *
 * Expected request: POST with FormData containing an {@code image} field (JPEG blob).
 *
 * ML service URL is read from {@code ML_SERVICE_URL} (default {@code http://localhost:8001}).
 * In Docker, set {@code ML_SERVICE_URL=http://reporthole-ml:8001} in the FE compose env block.
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://localhost:8001";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof Blob)) {
        return NextResponse.json({ error: "Missing image field" }, { status: 400 });
    }

    const upstream = new FormData();
    upstream.append("image", image, "frame.jpg");

    let response: Response;
    try {
        response = await fetch(`${ML_SERVICE_URL}/predict`, {
            method: "POST",
            body: upstream,
        });
    } catch {
        return NextResponse.json({ error: "ML service unreachable" }, { status: 502 });
    }

    if (!response.ok) {
        const text = await response.text();
        return NextResponse.json({ error: text }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
}
