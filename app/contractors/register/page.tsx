"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/shared/Authcard";
import LogoPin from "@/components/shared/Logopin";
import InputField from "@/components/shared/Inputfield";
import { useCompleteRegistration } from "@/app/api/generated/contractor-registration/contractor-registration";
import { getErrorMessage } from "@/lib/getErrorMessage";

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function ContractorRegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const displayError = error ?? (
        !token
            ? "This invite link is invalid or has expired. Please ask your admin to resend the invitation."
            : null
    );

    const { mutate: completeRegistration } = useCompleteRegistration({
        mutation: {
            onSuccess: () => {
                router.push("/login?contractor=registered");
            },
            onError: (err: unknown) => {
                setIsSubmitting(false);
                const status = (err as { response?: { status?: number } }).response?.status;
                if (status === 400) {
                    setError(getErrorMessage(err, "Invalid or expired invite token."));
                } else {
                    setError("Something went wrong. Please try again later.");
                }
            },
        },
    });

    const handleSubmit = () => {
        setError(null);

        if (!token) {
            setError("This invite link is invalid or has expired.");
            return;
        }

        if (!firstName || !lastName || !phoneNumber || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (!PASSWORD_REGEX.test(password)) {
            setError("Password must be at least 8 characters and contain at least one number and one special character.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        completeRegistration({ data: { token, firstName, lastName, phoneNumber, password } });
    };

    const personIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
    );

    const lockIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
        </svg>
    );

    return (
        <AuthCard>
            <LogoPin />

            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Complete Registration</h1>
                <p className="text-gray-500 mt-1 text-sm">Set up your contractor account to get started</p>
            </div>

            <div className="flex flex-col gap-4 w-full">
                <InputField
                    label="First Name"
                    placeholder="John"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    icon={personIcon}
                />

                <InputField
                    label="Last Name"
                    placeholder="Doe"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    icon={personIcon}
                />

                <InputField
                    label="Phone Number"
                    placeholder="+27 71 234 5678"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <InputField
                    label="Password"
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={lockIcon}
                />
                <p className="text-xs text-gray-400 -mt-1">
                    Min. 8 characters · at least 1 number · at least 1 special character (!@#$%…)
                </p>

                <InputField
                    label="Confirm Password"
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={lockIcon}
                />

                {displayError && (
                    <p className="text-sm text-red-500 text-center">{displayError}</p>
                )}
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !token}
                className="w-full bg-gray-900 hover:bg-gray-800 active:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-xl py-3.5 text-sm"
            >
                {isSubmitting ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthCard>
    );
}

export default function ContractorRegisterPage() {
    return (
        <Suspense fallback={null}>
            <ContractorRegisterForm />
        </Suspense>
    );
}
