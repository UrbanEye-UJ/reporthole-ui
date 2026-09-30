import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: { unoptimized: true },
    // Comma-separated local IPs for mobile dev testing (e.g. ALLOWED_DEV_ORIGINS=192.168.1.100).
    // Only relevant in dev — ignored entirely in production builds.
    allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],

    // All /api/** requests are handled by Route Handlers now (app/api/[...path]/route.ts and the
    // more specific app/api/auth/{login,logout}/route.ts), not a rewrite — a plain rewrite can't
    // attach the Authorization header the HttpOnly reporthole_token cookie requires. See
    // lib/backend.ts for the same INTERNAL_API_URL this used to read directly.
};

export default nextConfig;
