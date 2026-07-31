# Next.js Route Handlers (`app/api/`)

Server-side Route Handlers that proxy requests between the browser and external services. The browser only ever talks to the Next.js server — it never needs to know the backend's address or hold credentials for third-party services.

---

## Route handlers

### `/api/incidents/events` — SSE proxy

**File:** `app/api/incidents/events/route.ts`

Proxies the real-time SSE stream from the Spring Boot backend to the browser.

**Why a proxy?** The browser's `EventSource` API cannot set custom headers, so the JWT cannot be sent as `Authorization: Bearer`. The Route Handler runs on the Next.js server, reads the `reporthole_token` cookie from the incoming request, and forwards it as an `Authorization` header when connecting to `GET /incidents/events?token=<jwt>` on the backend.

The browser connects to `/api/incidents/events` — it never needs the backend's address.

In Docker, `INTERNAL_API_URL=http://reporthole-be:8080/api` ensures the Route Handler reaches the backend via the Docker internal network.

---

### `/api/image-proxy` — image proxy

**File:** `app/api/image-proxy/route.ts`

Fetches incident images from the backend's local disk storage and streams them to the browser.

**Why a proxy?** Images are stored at `uploads/incidents/<uuid>.jpg` on the backend server. In Docker, the URL stored in the DB uses the Docker service name (`http://reporthole-be:8080/...`) which the browser cannot resolve. The proxy rewrites the URL using `INTERNAL_API_URL` and fetches the image server-side, then streams the response to the browser.

Usage in components:
```tsx
<img src={`/api/image-proxy?url=${encodeURIComponent(incident.imageUrl)}`} />
```

---

### `/api/ml/predict` — ML inference proxy

**File:** `app/api/ml/predict/route.ts`

Forwards dashcam frame images from the browser to the `reporthole-ml` FastAPI inference service.

**Why a proxy?** Keeps the ML service address (`http://localhost:8001`) server-side so the browser doesn't need direct access to it. Also allows adding auth headers or request preprocessing without changing the dashcam client code.

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
