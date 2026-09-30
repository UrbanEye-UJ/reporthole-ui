jest.mock("axios", () => ({
    create: jest.fn(() => ({
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    })),
}));

import type { InternalAxiosRequestConfig } from "axios";
import * as axiosLib from "@/lib/axios";
const { requestInterceptor, responseErrorInterceptor, router } = axiosLib;

/** Minimal request config for the interceptor test doubles below — headers content is all these tests need. */
const configWithHeaders = (headers: Record<string, string>) =>
    ({ headers } as unknown as InternalAxiosRequestConfig);

const setCookie = (value: string) => {
    Object.defineProperty(document, "cookie", {
        value,
        configurable: true,
        writable: true,
    });
};

describe("axios interceptors", () => {
    describe("request interceptor", () => {
        // reporthole_token is HttpOnly now — the browser attaches it to same-origin /api/*
        // requests on its own, and the catch-all proxy Route Handler (app/api/[...path]/route.ts)
        // is what turns it into an Authorization header, server-side. This interceptor no longer
        // reads cookies or touches Authorization at all.
        it("never sets an Authorization header", () => {
            setCookie("reporthole_role=CIVILIAN; reporthole_user_id=abc123");
            const result = requestInterceptor(configWithHeaders({}));
            expect((result.headers as Record<string, string>).Authorization).toBeUndefined();
        });
    });

    describe("response interceptor", () => {
        let navigateSpy: jest.SpyInstance;

        beforeEach(() => {
            navigateSpy = jest.spyOn(router, "navigate").mockImplementation(() => {});
            // Ensure document.cookie is writable so the 401 handler can clear it
            setCookie("");
        });

        afterEach(() => {
            navigateSpy.mockRestore();
        });

        it("redirects to / on 401 when no token was present", async () => {
            await responseErrorInterceptor({ response: { status: 401 } }).catch(() => {});
            expect(navigateSpy).toHaveBeenCalledWith("/");
        });

        it("does not redirect on non-401 errors", async () => {
            await responseErrorInterceptor({ response: { status: 500 } }).catch(() => {});
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });
});
