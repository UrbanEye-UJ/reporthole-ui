import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { level = "error", message } = await req.json();
    const log = level === "warn" ? console.warn : console.error;
    log("[client]", message);
    return NextResponse.json({ ok: true });
}
