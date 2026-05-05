"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/shared/Authcard";
import LogoPin from "@/components/shared/Logopin";
import InputField from "@/components/shared/Inputfield";
import { useSave } from "@/app/api/generated/authentication/authentication";

export default function RegisterPage() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { mutate: register } = useSave({
        mutation: {
            onSuccess: () => {
                router.push("/login");
            },
            onError: (err: any) => {
                setIsSubmitting(false);
                const status = err.response?.status;
                if (status === 400) {
                    setError("An account with this email already exists.");
                } else {
                    setError("Something went wrong. Please try again later.");
                }
            },
        },
    });

    const handleRegister = () => {
        setError(null);

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        register({
            data: {
                firstName,
                lastName,
                email,
                password,
                role: "CIVILIAN",
                phoneNumber: "",
            },
        });
    };

    return (
        <AuthCard>
            <LogoPin />

            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                <p className="text-gray-500 mt-1 text-sm">Join us to make your city better</p>
            </div>

            <div className="flex flex-col gap-4 w-full">
                <InputField
                    label="First Name"
                    placeholder="John"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <InputField
                    label="Last Name"
                    placeholder="Doe"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <InputField
                    label="Email"
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                        </svg>
                    }
                />

                <InputField
                    label="Password"
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <InputField
                    label="Confirm Password"
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                        </svg>
                    }
                />

                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}
            </div>

            <button
                type="button"
                onClick={handleRegister}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-xl py-3.5 text-sm"
            >
                {isSubmitting ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                    Login
                </Link>
            </p>
        </AuthCard>
    );
}