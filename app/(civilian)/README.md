# Feature: (civilian)

Civilian route group. All pages here require an authenticated user with role `CIVILIAN`. The middleware enforces this — unauthenticated or wrong-role users are redirected.

---

## Pages

```
(civilian)/
├── civilian/dashboard/page.tsx   — main reporting hub: incident list + report button
├── dashcam/page.tsx              — dashcam live-feed interface for automated detection
└── profile/page.tsx              — view and edit the user's own profile
```

---

## Civilian dashboard (`/civilian/dashboard`)

The core civilian experience:

1. **Incident list** — calls `useGetMyIncidents` on mount. Shows all incidents the user has reported or confirmed, each rendered as an `IssueCard`.
2. **Report button** — opens `ReportIssueModal`. Geolocation is requested as soon as the modal opens.
3. **Real-time updates** — the page subscribes to the SSE stream via `/api/incidents/events` (the Next.js Route Handler proxy). On an `incident-updated` event, `useGetMyIncidents` is refetched. A `useEffect` watching the fresh data syncs any open `IncidentDetailModal` with the updated `reportCount`.
4. **Duplicate flow** — if the backend returns `duplicate: true`, the submit button changes to "Confirm duplicate". Calling confirm calls `useConfirmIncident`, which increments `reportCount` and triggers an SSE push to all linked reporters.

---

## Dashcam page (`/dashcam`)

Provides a live-camera UI for the automated dashcam detection mode. The page:
- Streams the device camera using `getUserMedia`.
- Sends frames to `/api/ml/predict` (the Next.js ML proxy Route Handler) which forwards to the `reporthole-ml` FastAPI service.
- On a detection, prompts the user to confirm before creating an incident.

Dashcam incidents are submitted with `source: "DASHCAM"` on the `IncidentRequestDTO`.

---

## Profile page (`/profile`)

Shows the authenticated user's decrypted PII (name, email, phone) via `useGetUserProfile`. Allows updates via `useUpdateProfile`. Profile data is AES-encrypted at rest on the backend — the frontend receives it already decrypted in the response.

---

## Components used

| Component | Used in |
|-----------|---------|
| `ReportIssueModal` | dashboard — full report submission flow |
| `IncidentDetailModal` | dashboard — shows status, reporter count, SSE-synced updates |
| `IssueCard` | dashboard — incident list items |
| `StatusCard` | dashboard — status badge display |
| `LocationPickerMap` | ReportIssueModal — lets user confirm or adjust GPS pin |

---

## Tests

| Test file | Covers |
|-----------|--------|
| `__tests__/civilian-dashboard.test.tsx` | Incident list, report modal open/close |
| `__tests__/ReportIssueModal.test.tsx` | Form validation, image compression, submit |
| `__tests__/IncidentDetailModal.test.tsx` | Detail view, SSE update sync |
| `__tests__/IssueCard.test.tsx` | Incident card rendering |
| `__tests__/dashcam.test.tsx` | Dashcam page rendering |
