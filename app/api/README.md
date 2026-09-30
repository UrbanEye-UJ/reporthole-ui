# Next.js Route Handlers (`app/api/`)

Server-side Route Handlers that proxy requests between the browser and the Spring Boot backend. The browser only ever talks to the Next.js server — it never needs to know the backend's address, and it never sees the JWT directly.

---

## Route handlers

### `/api/[...path]` — generic proxy

**File:** `app/api/[...path]/route.ts`

Catch-all for every `/api/**` request that isn't handled by a more specific route below. Reads the `reporthole_token` cookie (`HttpOnly` — set by `/api/auth/login`, so client JS can't read it) and forwards the request to the backend with `Authorization: Bearer <token>` attached, streaming the response back unchanged. This is also what makes `/api/incidents/events` (SSE) work: the Route Handler runs server-side, so it can attach a real `Authorization` header even though the browser's `EventSource` API can't set custom headers itself.

Backend address comes from `lib/backend.ts` (`INTERNAL_API_URL`, set at build time — `.env.local` in dev, a Dockerfile `ARG` pointing at `http://reporthole-be:8080/api` in Docker).

---

### `/api/image-proxy` — incident image proxy

**File:** `app/api/image-proxy/route.ts`

Streams an incident image server-side instead of letting the browser request the stored `imageUrl` directly. That URL is built by the backend from `SERVICES_WEB_BASE_URL` or an auto-detected local/Docker IP (see `LocalImageStorageServiceImpl`), which in Docker dev is only reachable from other containers, not from the browser on the host.

Only the filename is trusted from the incoming `url` query param (validated against the backend's `<uuid>.jpg` naming convention) — the request is always re-issued against `INTERNAL_API_URL` + `/uploads/incidents/<filename>`, so the param can't redirect this server-side fetch at an arbitrary host. `/uploads/**` is `permitAll` on the backend (see `SecurityConfig`), so no `Authorization` header is needed.

---

### `/api/auth/login` — login

**File:** `app/api/auth/login/route.ts`

Forwards `POST /auth/login` to the backend, then converts the token in the response body into an `HttpOnly`, `Secure` cookie instead of returning it to client JS. Also sets plain (non-`HttpOnly`) `reporthole_role`, `reporthole_user_id` and `reporthole_token_exp` cookies the UI reads directly (role-based redirects, the "is someone logged in" check, the session-expiry countdown).

---

### `/api/auth/logout` — logout

**File:** `app/api/auth/logout/route.ts`

Invalidates the session server-side (best-effort call to the backend's `POST /auth/logout`) and clears every session cookie via the response's `Set-Cookie` headers — the only way to clear `reporthole_token` now that it's `HttpOnly`.

---

## Generated API client (`app/api/generated/`)

This directory contains orval-generated TypeScript hooks — **do not edit these files**. They are regenerated every time `npm run generate:api` runs.

| File | Contents |
|------|----------|
| `openAPIDefinition.schemas.ts` | All request/response TypeScript types |
| `incidents/incidents.ts` | Hooks for `/incidents/*` endpoints |
| `authentication/authentication.ts` | Hooks for `/auth/*` endpoints |
| `user-profile/user-profile.ts` | Hooks for `/users/me` endpoints |
| `devices/devices.ts` | Hooks for `/devices/*` endpoints |
| `inference/inference.ts` | Hooks for `/inference/*` endpoints |

After regenerating, commit the generated files so teammates get the updated types when they pull.
