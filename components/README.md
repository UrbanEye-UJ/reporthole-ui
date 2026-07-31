# Components

Reusable UI components organised by role/feature. Components in `shared/` are used across multiple route groups.

---

## `shared/` — cross-feature components

| Component | Purpose |
|-----------|---------|
| `ReportIssueModal.tsx` | Full incident submission flow: camera/upload → compress → category → submit. Handles duplicate response and confirm flow. |
| `IncidentDetailModal.tsx` | Detailed view of a single incident: image, status, reporter count, issue type. Updates in real time via SSE event sync. |
| `IssueCard.tsx` | Compact incident summary card used in list views. Shows thumbnail, category badge, status, and date. |
| `StatusCard.tsx` | Badge/pill component for `AssignmentStatus` values. Colour-coded by status stage. |
| `LocationPickerMap.tsx` | Interactive map (Leaflet) for confirming or adjusting the GPS pin before submitting a report. |
| `Authcard.tsx` | Card wrapper layout shared by all auth pages (login, register, forgot password). |
| `Inputfield.tsx` | Labelled input component with built-in error state and accessible styling. |
| `SessionExpiryWarning.tsx` | Banner/modal that appears when the JWT is close to expiry, prompting the user to re-authenticate. |
| `Logopin.tsx` | Branded map pin icon used on the location picker map. |

---

## `civilian/` — civilian-only components

Components specific to the civilian dashboard and reporting flow that are too large to live inside the page file itself.

---

## `admin/` — admin-only components

Components for the admin dashboard. Currently minimal — the full admin UI is planned.

---

## `contractor/` — contractor-only components

Components for the contractor dashboard. Currently minimal — the full contractor UI is planned.

---

## `auth/` — auth-specific components

Additional components used only within the `(auth)` route group.

---

## Conventions

- Shared components must not import from role-specific directories (`civilian/`, `admin/`, etc.) — dependency only flows inward.
- All components receive data as props — no direct API calls inside shared components. Data fetching lives in the page or a custom hook.
- Use the generated orval hooks in page components or hooks, never in presentational components.
