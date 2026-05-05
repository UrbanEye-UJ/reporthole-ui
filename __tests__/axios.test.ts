jest.mock("axios", () => ({
    create: jest.fn(() => ({
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    })),
}));

import * as axiosLib from "@/lib/axios";
const { requestInterceptor, responseErrorInterceptor, router } = axiosLib;

const setCookie = (value: string) => {
    Object.defineProperty(document, "cookie", {
        value,
        configurable: true,
        writable: true,
    });
};

describe("axios interceptors", () => {
    describe("request interceptor", () => {
        it("adds Authorization header when token cookie is present", () => {
            setCookie("reporthole_token=my-jwt");
            const result = requestInterceptor({ headers: {} });
            expect((result.headers as any).Authorization).toBe("Bearer my-jwt");
        });

        it("does not add Authorization header when no token cookie", () => {
            setCookie("");
            const result = requestInterceptor({ headers: {} });
            expect((result.headers as any).Authorization).toBeUndefined();
        });

        it("reads only the token cookie when multiple cookies are present", () => {
            setCookie("other=value; reporthole_token=abc123; reporthole_role=CIVILIAN");
            const result = requestInterceptor({ headers: {} });
            expect((result.headers as any).Authorization).toBe("Bearer abc123");
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

        it("redirects to /login on 401", async () => {
            await responseErrorInterceptor({ response: { status: 401 } }).catch(() => {});
            expect(navigateSpy).toHaveBeenCalledWith("/login");
        });

        it("does not redirect on non-401 errors", async () => {
            await responseErrorInterceptor({ response: { status: 500 } }).catch(() => {});
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });
});
