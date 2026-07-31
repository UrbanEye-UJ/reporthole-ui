# Feature: (auth)

Authentication route group. All pages here are public — accessible without a JWT. The middleware redirects already-authenticated users away from these routes.

---

## Pages

```
(auth)/
├── login/page.tsx            — email + password form; sets reporthole_token cookie on success
├── register/page.tsx         — civilian account creation
├── forgot-password/page.tsx  — enter email to trigger password-reset email
├── reset-password/page.tsx   — enter new password using the token from the reset email
└── verify/page.tsx           — email-verification landing page (handles token from URL)
```

---

## Auth flow

1. **Register** (`/register`) — calls `useRegister` mutation. On success, the API returns a JWT which is stored as `reporthole_token` cookie and the user is redirected to their dashboard.
2. **Login** (`/login`) — calls `useLogin` mutation. Same cookie + redirect behaviour.
3. **Forgot password** (`/forgot-password`) — calls `useForgotPassword`. Backend sends a reset link to the user's email (delivered via MailHog locally).
4. **Reset password** (`/reset-password?token=...`) — reads the `token` query param, calls `useResetPassword` with the new password.
5. **Verify** (`/verify?token=...`) — email-verification callback page; calls the verification endpoint and shows the result.

---

## JWT cookie

The `reporthole_token` cookie is set by the Axios response interceptor in `lib/axios.ts` after a successful login or register. It is an HTTP-only cookie — JavaScript cannot read it directly; the Axios instance has credentials enabled so it is sent automatically on every request.

`middleware.ts` checks for this cookie on every navigation. If missing on a protected route, the user is redirected to `/login`. If present on an auth route (e.g. `/login`), the user is redirected to their role-appropriate dashboard.

---

## Components used

- `components/shared/Authcard.tsx` — card wrapper used on all auth pages
- `components/shared/Inputfield.tsx` — styled input with label and error state
- `components/auth/` — any auth-specific sub-components

---

## Tests

`__tests__/login.test.tsx` — covers the login page form submission and error states.
