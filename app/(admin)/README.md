# Feature: (admin)

Admin route group. Requires an authenticated user with role `ADMIN`. The middleware blocks access for any other role.

---

## Pages

```
(admin)/
└── admin/dashboard/page.tsx   — admin overview dashboard
```

---

## Current state

The admin dashboard is a role-gated placeholder. The full admin feature set — incident management, status transitions, contractor assignment, and analytics — is planned but not yet implemented.

What is in place:
- Route protection: `middleware.ts` redirects non-ADMIN users to their own dashboard.
- Basic dashboard page scaffold.

---

## Planned features (not yet built)

- View all reported incidents across all users with filtering by status and issue type.
- Trigger status transitions (`REPORTED → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED`).
- Assign incidents to contractors.
- View incident heatmap by GPS coordinates.
- User management (lock/unlock accounts, role changes).

---

## Components

- `components/admin/` — admin-specific components (currently minimal).
- `components/shared/StatusCard.tsx` — reused for status display.

---

## Tests

`__tests__/dashboards.test.tsx` — covers the admin dashboard page render.
