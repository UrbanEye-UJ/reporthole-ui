"use client";

import { useState } from "react";
import Link from "next/link";
import { useApply } from "@/app/api/generated/admin-applications/admin-applications";

export default function ApplyForAdminPage() {
    const [token, setToken] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { mutate: apply } = useApply({
        mutation: {
            onSuccess: () => setStatus("success"),
            onError: (err: unknown) => {
                const message =
                    (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                    ?? "Something went wrong. Please try again.";
                setErrorMessage(message);
                setStatus("error");
            },
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) return;
        setStatus("loading");
        setErrorMessage(null);
        apply({ data: { municipalityToken: token.trim() } });
    };

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/profile"
                        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        aria-label="Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Apply for Admin Access</h1>
                </div>

                {status === "success" ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Application submitted</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{"We'll review your request and be in touch soon."}</p>
                            </div>
                        </div>
                        <Link
                            href="/profile"
                            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl text-sm transition-colors text-center block"
                        >
                            Back to profile
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-300">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Enter the municipality token provided to you by your organisation to request admin access to Reporthole.
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Municipality token
                                </label>
                                <input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="e.g. GPJHB2025"
                                    required
                                    className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                />
                            </div>
                            {status === "error" && errorMessage && (
                                <p className="text-xs text-red-500 dark:text-red-400">{errorMessage}</p>
                            )}
                            <button
                                type="submit"
                                disabled={status === "loading" || !token.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                            >
                                {status === "loading" ? "Submitting…" : "Submit application"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
