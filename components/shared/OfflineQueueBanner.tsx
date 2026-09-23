"use client";

import { useEffect, useState } from "react";
import { count as countQueued } from "@/lib/offlineQueue";

/**
 * Small persistent banner showing how many offline-queued reports/updates are waiting to
 * sync. Listens for the "offline-queue-changed" event dispatched by `useOfflineSync.ts`.
 */
export default function OfflineQueueBanner() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        countQueued().then(setCount);
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ count: number }>).detail;
            setCount(detail?.count ?? 0);
        };
        window.addEventListener("offline-queue-changed", handler);
        return () => window.removeEventListener("offline-queue-changed", handler);
    }, []);

    if (count === 0) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>
            {count} {count === 1 ? "report" : "reports"} waiting to sync
        </div>
    );
}
