# Admin Panel — `(admin)/`

Role-gated section of the Reporthole frontend. Only users with the `ADMIN` role can access these routes. The Next.js middleware redirects any other role to their own dashboard before the page renders.

---

## Directory structure

```
(admin)/
├── admin/
│   ├── layout.tsx              — AdminLayout: wraps all admin pages with MUI ThemeProvider,
│   │                             QueryClientProvider, and AdminShell
│   ├── dashboard/page.tsx      — Operations Center (KPI cards, map, recent incidents, charts)
│   ├── incidents/page.tsx      — Incident register table with search and status filter
│   ├── infrastructure/page.tsx — Infrastructure map view
│   ├── contractors/page.tsx    — Contractor management table
│   ├── citizens/page.tsx       — Citizen account table
│   ├── analytics/page.tsx      — Analytics charts and trends
│   ├── reports/page.tsx        — Downloadable reports
│   └── settings/page.tsx       — Platform settings and system information
│
├── _components/
│   ├── layout/
│   │   ├── AdminShell.tsx      — Outer grid layout (sidebar + topbar + main content area)
│   │   ├── AdminSidebar.tsx    — Collapsible nav sidebar with active-link highlighting
│   │   └── AdminTopbar.tsx     — Top bar (breadcrumbs, actions)
│   ├── ui/
│   │   ├── MetricCard.tsx      — KPI card with trend indicator
│   │   ├── PageHeader.tsx      — Consistent page title + subtitle + action slot
│   │   ├── Panel.tsx           — Elevated card container
│   │   ├── StatusBadge.tsx     — Coloured status chip (Open / Assigned / In Progress / Resolved)
│   │   └── SearchField.tsx     — Styled MUI search input
│   ├── tables/
│   │   ├── DataTable.tsx       — MUI X DataGrid wrapper
│   │   ├── TableToolbar.tsx    — Title, count, left/right content slots above the table
│   │   ├── TableSearch.tsx     — Controlled search input for table filtering
│   │   └── TableFilters.tsx    — Dropdown filter (e.g. status)
│   ├── charts/
│   │   ├── AreaChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── ChartLine.tsx
│   │   └── DoughnutChart.tsx
│   ├── dashboard/
│   │   ├── IncidentMap.tsx     — Dynamic-imported Leaflet map wrapper (SSR disabled)
│   │   ├── IncidentMapContent.tsx
│   │   ├── AISummary.tsx       — AI-generated incident summary panel (placeholder)
│   │   ├── RecentIncidents.tsx — Latest incident list
│   │   ├── RepairProgress.tsx  — Repair completion progress bars
│   │   └── SeverityChart.tsx   — Doughnut chart of incidents by severity
│   ├── map/
│   │   ├── GautengMap.tsx      — Leaflet map of Gauteng (dynamic import, no SSR)
│   │   ├── GautengMapContent.tsx
│   │   └── MapControls.tsx
│   ├── navigation.ts           — Typed array of sidebar nav items (label, path, icon)
│   └── styles/
│       ├── theme.ts            — MUI dark theme for admin
│       └── globals.css         — Admin-scoped global styles
│
└── frontend/                   — Legacy Vite/React prototype (not served by Next.js).
                                  Source of truth is the admin/ pages above.
```

---

## Tech stack

| Concern | Library |
|---|---|
| Component library | MUI v6 (`@mui/material`) |
| Data grid | MUI X DataGrid (`@mui/x-data-grid`) |
| Charts | Recharts (via custom wrappers in `_components/charts/`) |
| Map | Leaflet + react-leaflet (dynamic import, SSR disabled) |
| State / data fetching | TanStack Query (QueryClient configured in `AdminLayout`) |
| Styling | MUI `sx` prop + theme tokens; no Tailwind in the admin subtree |

---

## Layout and theming

`AdminLayout` (`admin/layout.tsx`) is a **Client Component** that provides:

- `AppRouterCacheProvider` — MUI emotion cache for the App Router
- `ThemeProvider` — admin-specific dark theme (`_components/styles/theme.ts`)
- `QueryClientProvider` — isolated QueryClient; stale time 5 min, gc time 30 min

`AdminShell` renders a CSS Grid: sidebar in column 1 (rows 1–2), topbar in row 1 column 2, `<main>` in row 2 column 2. The sidebar collapses to 80 px via a toggle that lives in `AdminShell` state.

The dark background is applied on `AdminShell`'s wrapper `<Box>` rather than via `CssBaseline` on `<body>`. This prevents the dark styles from leaking into the civilian UI during SPA navigation between route groups.

---

## Navigation

`_components/navigation.ts` exports a typed `NavigationItem[]` array. `AdminSidebar` maps over it and uses Next.js `<Link>` for client-side navigation. `usePathname()` drives the active-link highlight — no extra state needed.

To add a nav item, append an entry to the array in `navigation.ts`. The sidebar picks it up automatically.

---

## Data — current state (mock / placeholder)

All admin pages currently render **static mock data**. No admin API endpoints exist yet. Each page has a `TODO(api)` comment that names the expected endpoint and response shape.

| Page | Expected endpoint (not yet built) |
|---|---|
| Dashboard KPI cards | `GET /admin/dashboard/stats` |
| Incidents table | `GET /admin/incidents` (paginated) |
| Infrastructure map | `GET /admin/infrastructure` |
| Contractors | `GET /admin/contractors` |
| Citizens | `GET /admin/citizens` |
| Analytics | `GET /admin/analytics` |
| Reports | `GET /admin/reports` |
| Settings | `GET /admin/settings/status`, `PUT /admin/settings` |

When BE endpoints are ready: add them to the Spring Boot controller with Swagger annotations, restart the BE, run `npx orval` in `reporthole-fe/`, then replace the mock `rows` arrays with the generated hooks.

---

## Dev performance — first-visit compile delay

**In development (`npm run dev` / `npm run dev:https`) admin pages are slow on first visit.** This is expected and is not a bug.

Next.js with webpack uses **lazy (on-demand) compilation** — a page's bundle is only compiled the first time it is requested. The server logs show this clearly:

```
○ Compiling /admin/dashboard ...
 GET /admin/dashboard 200 in 10.9s   ← first visit: compiles on demand

 GET /admin/dashboard 200 in 36ms    ← second visit: instant
```

Admin pages take longer to compile than civilian pages because they pull in heavier dependencies on first load: MUI's full component tree, MUI X DataGrid, Recharts, Leaflet, and the admin theme. Civilian pages only use Tailwind-styled components with no large UI libraries.

**This delay does not occur in production.** `next build` pre-compiles all pages upfront, so every page opens instantly regardless of whether it has been visited before.

**Workaround in development:** visit each admin page once after starting the dev server. The compiled bundles stay cached for the rest of the session.

---

## Tests

`__tests__/dashboards.test.tsx` covers the admin dashboard page render.

When new admin pages or components are added, add corresponding tests in `__tests__/`.
