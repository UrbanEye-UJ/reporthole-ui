"use client";

import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";

/**
 * Icon button that triggers the native PWA install prompt. Renders nothing when
 * the browser hasn't fired `beforeinstallprompt` (already installed, running in
 * standalone mode, or a browser — e.g. Safari/iOS — that doesn't support it).
 */
export default function InstallAppButton() {
    const { canInstall, promptInstall } = useInstallPrompt();

    if (!canInstall) return null;

    return (
        <button
            type="button"
            onClick={promptInstall}
            aria-label="Install app"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
        </button>
    );
}
