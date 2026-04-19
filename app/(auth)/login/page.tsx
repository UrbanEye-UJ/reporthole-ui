"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/shared/Authcard";
import LogoPin from "@/components/shared/Logopin";
import InputField from "@/components/shared/Inputfield";
import { useLogin } from "@/app/api/generated/authentication/authentication";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const { mutate: login, isPending } = useLogin({
        mutation: {
            onSuccess: (response) => {
                // response.data is a plain JWT string (responseType: 'text' in generated client)
                const token = response.data;

                document.cookie = `reporthole_token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;

                router.push("/civilian/dashboard");
            },
            onError: (err) => {
                const status = err.response?.status;
                if (status === 404) {
                    setError("No account found with that email.");
                } else if (status === 400) {
                    setError("Incorrect password. Please try again.");
                } else {
                    setError("Something went wrong. Please try again later.");
                }
            },
        },
    });

    const handleLogin = () => {
        setError(null);
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        login({ data: { email, password } });
    };

    return (
        <AuthCard>
            <LogoPin />

            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-500 mt-1 text-sm">Login to continue reporting issues</p>
            </div>

            <div className="flex flex-col gap-4 w-full">
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
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                        </svg>
                    }
                />

                <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-sm text-blue-600 font-medium hover:underline">
                        Forgot password?
                    </Link>
                </div>

                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}
            </div>

            <button
                type="button"
                onClick={handleLogin}
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-semibold rounded-xl py-3.5 text-sm"
            >
                {isPending ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                    Sign up
                </Link>
            </p>
        </AuthCard>
    );
}