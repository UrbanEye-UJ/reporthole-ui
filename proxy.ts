import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];

const ROLE_DASHBOARDS: Record<string, string> = {
    CIVILIAN: "/civilian/dashboard",
    ADMIN: "/admin/dashboard",
    CONTRACTOR: "/contractor/dashboard",
};

const ROLE_PREFIXES: Record<string, string> = {
    CIVILIAN: "/civilian",
    ADMIN: "/admin",
    CONTRACTOR: "/contractor",
};

export function proxy(request: NextRequest) {
    const token = request.cookies.get("reporthole_token")?.value;
    const role = request.cookies.get("reporthole_role")?.value ?? "";
    const { pathname } = request.nextUrl;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    // No token → send to login
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Has token but on a public route → send to their dashboard
    if (token && isPublicRoute) {
        const dashboard = ROLE_DASHBOARDS[role] ?? "/civilian/dashboard";
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Has token but accessing a route belonging to a different role → send to their dashboard
    if (token) {
        const allowedPrefix = ROLE_PREFIXES[role];
        const isWrongRoleRoute = Object.values(ROLE_PREFIXES).some(
            (prefix) => pathname.startsWith(prefix) && prefix !== allowedPrefix
        );
        if (isWrongRoleRoute) {
            const dashboard = ROLE_DASHBOARDS[role] ?? "/civilian/dashboard";
            return NextResponse.redirect(new URL(dashboard, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
