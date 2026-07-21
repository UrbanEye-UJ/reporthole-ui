import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: { unoptimized: true },
    allowedDevOrigins: ["192.168.1.101"],

    /**
     * Proxy all /api/** requests to the Spring Boot backend.
     *
     * Next.js applies rewrites AFTER route handlers (afterFiles phase), so the
     * SSE proxy (/api/incidents/events) and image proxy (/api/image-proxy) Route
     * Handlers are matched first and never reach this rewrite.
     *
     * INTERNAL_API_URL is set at build time:
     *   - dev:    .env.local → http://localhost:8080/api
     *   - Docker: Dockerfile ARG → http://reporthole-be:8080/api
     */
    async rewrites() {
        const backend = process.env.INTERNAL_API_URL ?? "http://localhost:8080/api";
        return [
            {
                source: "/api/:path*",
                destination: `${backend}/:path*`,
            },
        ];
    },
};

export default nextConfig;
