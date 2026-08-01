"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/shared/Authcard";
import LogoPin from "@/components/shared/Logopin";
import { useVerifyEmail } from "@/app/api/generated/authentication/authentication";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [status, setStatus] = useState<"verifying" | "success" | "expired" | "invalid" | "error">("verifying");

    const { mutate: verifyEmail } = useVerifyEmail({
        mutation: {
            onSuccess: () => setStatus("success"),
            onError: (err: unknown) => {
                const httpStatus = (err as { response?: { status?: number } }).response?.status;
                if (httpStatus === 410) setStatus("expired");
                else if (httpStatus === 404 || httpStatus === 400) setStatus("invalid");
                else setStatus("error");
            },
        },
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!token) { setStatus("invalid"); return; }
        verifyEmail({ params: { token } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <>
            <AuthCard>
                <LogoPin />

                {status === "verifying" && (
                    <div className="text-center flex flex-col items-center gap-4">
                        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Verifying your email…</h1>
                            <p className="text-gray-500 mt-1 text-sm">Please wait, this only takes a moment.</p>
                        </div>
                    </div>
                )}

                {status === "expired" && (
                    <>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">Link expired</h1>
                            <p className="text-gray-500 mt-2 text-sm">
                                This verification link has expired. Register again and we will send you a fresh one.
                            </p>
                        </div>
                        <Link
                            href="/register"
                            className="w-full block text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors text-white font-semibold rounded-xl py-3.5 text-sm"
                        >
                            Re-register
                        </Link>
                    </>
                )}

                {(status === "invalid" || status === "error") && (
                    <>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">Invalid link</h1>
                            <p className="text-gray-500 mt-2 text-sm">
                                This verification link is invalid or has already been used.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="w-full block text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors text-white font-semibold rounded-xl py-3.5 text-sm"
                        >
                            Back to login
                        </Link>
                    </>
                )}
            </AuthCard>

            {status === "success" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center gap-5 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Email verified!</h2>
                            <p className="text-gray-500 mt-1 text-sm">Your account is active. You can now sign in.</p>
                        </div>
                        <Link
                            href="/login"
                            className="w-full block text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors text-white font-semibold rounded-xl py-3.5 text-sm"
                        >
                            Go to login
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-sm">Loading…</p></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
