"use client";

import Link from "next/link";
import { useState } from "react";
import AuthCard from "@/components/shared/Authcard";
import LogoPin from "@/components/shared/Logopin";
import InputField from "@/components/shared/Inputfield";
import { useForgotPassword } from "@/app/api/generated/authentication/authentication";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { mutate: forgotPassword } = useForgotPassword({
        mutation: {
            onSuccess: () => {
                setSubmitted(true);
            },
            onError: (err: unknown) => {
                setIsSubmitting(false);
                const status = (err as { response?: { status?: number } }).response?.status;
                if (status === 404) {
                    setError("No account found with that email address.");
                } else {
                    setError("Something went wrong. Please try again later.");
                }
            },
        },
    });

    const handleSubmit = () => {
        setError(null);
        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        setIsSubmitting(true);
        forgotPassword({ data: { email } });
    };

    if (submitted) {
        return (
            <AuthCard>
                <LogoPin />
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Check your inbox</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        If an account exists for <span className="font-medium text-gray-700">{email}</span>,
                        you&apos;ll receive a password reset link shortly.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="w-full text-center bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold rounded-xl py-3.5 text-sm block"
                >
                    Back to login
                </Link>
            </AuthCard>
        );
    }

    return (
        <AuthCard>
            <LogoPin />

            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Enter your email and we&apos;ll send you a reset link.
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
                <InputField
                    label="Email"
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                        </svg>
                    }
                />

                {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-xl py-3.5 text-sm"
            >
                {isSubmitting ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-sm text-gray-500">
                Remember your password?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                    Back to login
                </Link>
            </p>
        </AuthCard>
    );
}
