"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/shared/Authcard";
import LogoPin from "@/components/shared/Logopin";
import InputField from "@/components/shared/Inputfield";
import { useResetPassword } from "@/app/api/generated/authentication/authentication";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { mutate: resetPassword } = useResetPassword({
        mutation: {
            onSuccess: () => {
                router.push("/login");
            },
            onError: (err: unknown) => {
                setIsSubmitting(false);
                const status = (err as { response?: { status?: number } }).response?.status;
                if (status === 410) {
                    setError("This reset link has expired or has already been used. Request a new one.");
                } else if (status === 404) {
                    setError("Account not found. The link may be invalid.");
                } else {
                    setError("Something went wrong. Please try again later.");
                }
            },
        },
    });

    const handleSubmit = () => {
        setError(null);

        if (!token) {
            setError("Invalid reset link. Please request a new one.");
            return;
        }
        if (!password) {
            setError("Please enter a new password.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        resetPassword({ data: { token, password } });
    };

    return (
        <AuthCard>
            <LogoPin />

            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Set new password</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Choose a strong password for your account.
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
                <InputField
                    label="New password"
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <InputField
                    label="Confirm password"
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                        </svg>
                    }
                />

                {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                        <p className="text-sm text-red-600">{error}</p>
                        {error.includes("expired") && (
                            <Link
                                href="/forgot-password"
                                className="text-sm text-red-700 font-semibold underline mt-1 block"
                            >
                                Request a new reset link →
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-xl py-3.5 text-sm"
            >
                {isSubmitting ? "Resetting..." : "Reset password"}
            </button>

            <p className="text-sm text-gray-500">
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                    Back to login
                </Link>
            </p>
        </AuthCard>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
