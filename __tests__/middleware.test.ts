/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

const makeRequest = (pathname: string, cookies: Record<string, string> = {}) => {
    const url = new URL(pathname, "http://localhost:3000");
    const request = new NextRequest(url);
    Object.entries(cookies).forEach(([name, value]) => request.cookies.set(name, value));
    return request;
};

const redirectUrl = (response: Response) =>
    response.headers.get("location");

describe("proxy", () => {
    describe("unauthenticated user", () => {
        it("redirects to login when accessing a protected route", () => {
            const response = proxy(makeRequest("/civilian/dashboard"));
            expect(redirectUrl(response)).toContain("/login");
        });

        it("allows access to /login", () => {
            const response = proxy(makeRequest("/login"));
            expect(response.status).toBe(200);
        });

        it("allows access to /register", () => {
            const response = proxy(makeRequest("/register"));
            expect(response.status).toBe(200);
        });
    });

    describe("authenticated CIVILIAN", () => {
        const cookies = { reporthole_token: "tok", reporthole_role: "CIVILIAN" };

        it("redirects to civilian dashboard when accessing /login", () => {
            const response = proxy(makeRequest("/login", cookies));
            expect(redirectUrl(response)).toContain("/civilian/dashboard");
        });

        it("allows access to /civilian/dashboard", () => {
            const response = proxy(makeRequest("/civilian/dashboard", cookies));
            expect(response.status).toBe(200);
        });

        it("blocks access to /admin/dashboard and redirects to civilian dashboard", () => {
            const response = proxy(makeRequest("/admin/dashboard", cookies));
            expect(redirectUrl(response)).toContain("/civilian/dashboard");
        });

        it("blocks access to /contractor/dashboard and redirects to civilian dashboard", () => {
            const response = proxy(makeRequest("/contractor/dashboard", cookies));
            expect(redirectUrl(response)).toContain("/civilian/dashboard");
        });
    });

    describe("authenticated ADMIN", () => {
        const cookies = { reporthole_token: "tok", reporthole_role: "ADMIN" };

        it("redirects to admin dashboard when accessing /login", () => {
            const response = proxy(makeRequest("/login", cookies));
            expect(redirectUrl(response)).toContain("/admin/dashboard");
        });

        it("allows access to /admin/dashboard", () => {
            const response = proxy(makeRequest("/admin/dashboard", cookies));
            expect(response.status).toBe(200);
        });

        it("blocks access to /civilian/dashboard and redirects to admin dashboard", () => {
            const response = proxy(makeRequest("/civilian/dashboard", cookies));
            expect(redirectUrl(response)).toContain("/admin/dashboard");
        });
    });

    describe("authenticated CONTRACTOR", () => {
        const cookies = { reporthole_token: "tok", reporthole_role: "CONTRACTOR" };

        it("redirects to contractor dashboard when accessing /login", () => {
            const response = proxy(makeRequest("/login", cookies));
            expect(redirectUrl(response)).toContain("/contractor/dashboard");
        });

        it("allows access to /contractor/dashboard", () => {
            const response = proxy(makeRequest("/contractor/dashboard", cookies));
            expect(response.status).toBe(200);
        });

        it("blocks access to /admin/dashboard and redirects to contractor dashboard", () => {
            const response = proxy(makeRequest("/admin/dashboard", cookies));
            expect(redirectUrl(response)).toContain("/contractor/dashboard");
        });
    });
});
