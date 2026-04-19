import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
    const token = request.cookies.get("reporthole_token")?.value;
    const { pathname } = request.nextUrl;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    // No token and trying to access a protected route → send to login
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Has token but trying to access login/register → send to dashboard
    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL("/civilian/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Run middleware on all routes except Next.js internals and static files
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};