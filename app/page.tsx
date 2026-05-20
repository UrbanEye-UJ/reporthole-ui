import Link from "next/link";
import LogoPin from "@/components/shared/Logopin";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-blue-600 flex flex-col items-center justify-center px-6">
            <div className="flex flex-col items-center gap-6 w-full max-w-sm">

                <LogoPin />

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">Reporthole</h1>
                    <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                        Report road issues in your area and help improve infrastructure for everyone
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full mt-6">
                    <Link
                        href="/login"
                        className="w-full bg-white text-blue-600 font-semibold text-sm text-center py-3.5 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                        Sign In
                    </Link>

                    <Link
                        href="/register"
                        className="w-full border border-white text-white font-semibold text-sm text-center py-3.5 rounded-xl hover:bg-blue-500 transition-colors"
                    >
                        Create Account
                    </Link>
                </div>
            </div>
        </main>
    );
}
