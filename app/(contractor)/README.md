# Feature: (contractor)

Contractor route group. Requires an authenticated user with role `CONTRACTOR`. The middleware blocks access for any other role.

---

## Pages

```
(contractor)/
└── contractor/dashboard/page.tsx   — contractor work queue dashboard
```

---

## Current state

The contractor dashboard is a role-gated placeholder. The full contractor feature set is planned but not yet implemented.

What is in place:
- Route protection: `middleware.ts` redirects non-CONTRACTOR users to their own dashboard.
- Basic dashboard page scaffold.

---

## Planned features (not yet built)

- View incidents assigned to this contractor (status `ASSIGNED`).
- Update incident status to `IN_PROGRESS` and `RESOLVED`.
- Upload evidence photos for completed repairs.
- View assigned location on a map.

---

## Components

- `components/contractor/` — contractor-specific components (currently minimal).
- `components/shared/StatusCard.tsx` — reused for status display.

---

## Tests

`__tests__/dashboards.test.tsx` — covers the contractor dashboard page render.
