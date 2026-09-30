import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { clearSessionCookies } from "@/lib/session";

const maskEmail = (email: string): string => {
    const atIndex = email.indexOf("@");
    if (atIndex < 1) return "***";
    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    const dotIndex = domain.lastIndexOf(".");
    const domainName = dotIndex > 0 ? domain.slice(0, dotIndex) : domain;
    const tld = dotIndex > 0 ? domain.slice(dotIndex) : "";
    return `${local[0]}***@${domainName[0]}***${tld}`;
};

// Wrapped in an object so tests can spy on it without jsdom location issues
export const router = {
    navigate(url: string) {
        window.location.href = url;
    },
};

export const getCookie = (name: string): string | undefined => {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1];
};

/**
 * Logs each outgoing call. Authorization is no longer attached here — `reporthole_token` is an
 * `HttpOnly` cookie now (client JS can't read it), so the browser sends it automatically to
 * same-origin `/api/*`, and the catch-all proxy Route Handler (`app/api/[...path]/route.ts`)
 * translates it into an `Authorization` header server-side before forwarding to the backend.
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const method = config.method?.toUpperCase() ?? "REQUEST";
    const url = config.url ?? "";

    if (url === "/auth/login" || url === "/auth/register") {
        const body = typeof config.data === "string" ? JSON.parse(config.data) : (config.data ?? {});
        const masked = body?.email ? ` — ${maskEmail(body.email)}` : "";
        console.log(`[API] ${method} ${url}${masked}`);
    } else {
        console.log(`[API] ${method} ${url}`);
    }

    return config;
};

export const responseErrorInterceptor = (error: unknown): Promise<never> => {
    const err = error as { response?: { status?: number }; config?: { url?: string }; code?: string };

    if (err.code === "ERR_CANCELED") {
        return Promise.reject(error);
    }

    const status = err.response?.status;
    const url = err.config?.url ?? "unknown";

    console.error(`[API] ${status ?? "NETWORK_ERROR"} ${url}`);

    if (status === 401) {
        // reporthole_token is HttpOnly now — this can't read it to tell "had a session" apart
        // from "never logged in" the way it used to. reporthole_role is a plain cookie set
        // alongside the token, so its presence stands in for "had a session" instead.
        const hadSession = document.cookie.includes("reporthole_role=");
        void clearSessionCookies();
        if (hadSession) {
            console.warn("[API] Session invalid — showing expiry warning");
            window.dispatchEvent(new CustomEvent("session-invalid"));
        } else {
            router.navigate("/");
        }
    }

    return Promise.reject(error);
};

const axiosInstance = axios.create({
    baseURL: "/api",
});

axiosInstance.interceptors.request.use(requestInterceptor);
axiosInstance.interceptors.response.use(
    (response) => response,
    responseErrorInterceptor
);

export const apiClient = <T>(config: AxiosRequestConfig): Promise<T> => {
    return axiosInstance(config).then((response) => response.data);
};
