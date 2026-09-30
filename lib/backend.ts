/**
 * Base URL for server-side calls to the Spring Boot backend from a Route Handler.
 *
 * Set at build/run time:
 *   - dev:    .env.local → http://localhost:8080/api
 *   - Docker: Dockerfile ARG → http://reporthole-be:8080/api
 *
 * Mirrors the fallback `next.config.ts` uses for its `/api/:path*` rewrite.
 */
export const BACKEND_URL = process.env.INTERNAL_API_URL ?? "http://localhost:8080/api";
