"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WARN_BEFORE_SECONDS = 15;
const COUNTDOWN_SECONDS = 15;

type Reason = "expiring" | "invalid";

function getTokenExpiry(): number | null {
    try {
        const token = document.cookie
            .split("; ")
            .find((r) => r.startsWith("reporthole_token="))
            ?.split("=")[1];
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return typeof payload.exp === "number" ? payload.exp : null;
    } catch {
        return null;
    }
}

function clearSession() {
    document.cookie = "reporthole_token=; path=/; max-age=0";
    document.cookie = "reporthole_role=; path=/; max-age=0";
}

export default function SessionExpiryWarning() {
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [reason, setReason] = useState<Reason>("expiring");
    const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const show = (r: Reason, seconds: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setReason(r);
        setSecondsLeft(seconds);
    };

    // Listen for 401-triggered invalidation from the axios interceptor
    useEffect(() => {
        const handler = () => show("invalid", COUNTDOWN_SECONDS);
        window.addEventListener("session-invalid", handler);
        return () => window.removeEventListener("session-invalid", handler);
    }, []);

    // Schedule the natural-expiry warning based on JWT exp
    useEffect(() => {
        const exp = getTokenExpiry();
        if (!exp) return;

        const msUntilWarn = exp * 1000 - Date.now() - WARN_BEFORE_SECONDS * 1000;

        if (msUntilWarn <= 0) {
            const remaining = Math.max(0, Math.round((exp * 1000 - Date.now()) / 1000));
            show("expiring", remaining);
        } else {
            warnTimerRef.current = setTimeout(() => show("expiring", WARN_BEFORE_SECONDS), msUntilWarn);
        }

        return () => {
            if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
        };
    }, []);

    // Start the countdown interval once the modal appears
    useEffect(() => {
        if (secondsLeft === null) return;

        intervalRef.current = setInterval(() => {
            setSecondsLeft((s) => (s !== null ? Math.max(0, s - 1) : null));
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [secondsLeft !== null]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-redirect when countdown reaches zero
    useEffect(() => {
        if (secondsLeft === 0) {
            clearSession();
            router.push("/login");
        }
    }, [secondsLeft]);

    const handleContinue = () => {
        clearSession();
        router.push("/login");
    };

    if (secondsLeft === null) return null;

    const isInvalid = reason === "invalid";

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                        </svg>
                    </div>
                    <h2 className="text-base font-bold text-gray-900">
                        {isInvalid ? "Session Expired" : "Session Expiring Soon"}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {isInvalid
                            ? "Your session is no longer valid. You will be redirected to the login page in "
                            : "You will be logged out in "}
                        <span className="font-semibold text-red-500">
                            {secondsLeft} second{secondsLeft !== 1 ? "s" : ""}
                        </span>
                        .
                    </p>
                </div>

                {/* Countdown bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="h-full bg-red-400 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(secondsLeft / COUNTDOWN_SECONDS) * 100}%` }}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                    Continue to login
                </button>
            </div>
        </div>
    );
}
