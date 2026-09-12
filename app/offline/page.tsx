import Link from "next/link";
import LogoPin from "@/components/shared/Logopin";

/**
 * Shown by the service worker (see app/sw.ts) instead of a network error when a
 * navigation fails while offline and nothing cached is available for that page.
 * Must stay statically renderable (no fetched data) so it can be precached at build time.
 */
export default function OfflinePage() {
    return (
        <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6 text-center">
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                <LogoPin />
                <h1 className="text-xl font-bold text-gray-900">You&apos;re offline</h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                    This page isn&apos;t available without a connection. Check your signal and try again —
                    anything you already opened stays available.
                </p>
                <Link
                    href="/"
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm text-center py-3.5 rounded-xl transition-colors"
                >
                    Try again
                </Link>
            </div>
        </main>
    );
}
