"use client";

/**
 * Manual "how to install" instructions — shown whenever there's no native browser prompt to
 * trigger directly (iOS always, since no browser there exposes one; plus any other browser
 * that hasn't offered `beforeinstallprompt` yet). Shared across every entry point in the app
 * (civilian/contractor/admin/security profile pages, the security topbar, and the public
 * landing page) so there's exactly one "install help" experience regardless of where it's
 * triggered from.
 */
export default function InstallInstructionsModal({
    open,
    onClose,
    isIOS,
}: {
    open: boolean;
    onClose: () => void;
    isIOS: boolean;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center px-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#202020] rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Install Reporthole</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isIOS
                            ? "Your browser doesn't support installing directly from here — add it manually instead:"
                            : "Your browser didn't offer a direct install option — you can usually add it manually instead:"}
                    </p>
                </div>
                {isIOS ? (
                    <ol className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-200">
                        <li className="flex items-center gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold">1</span>
                            <span className="flex items-center gap-1.5">
                                Tap the Share icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6-3l3-3m0 0l3 3m-3-3v11.25" />
                                </svg>
                                in your browser&apos;s toolbar
                            </span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold">2</span>
                            Scroll down and tap &ldquo;Add to Home Screen&rdquo;
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold">3</span>
                            Tap &ldquo;Add&rdquo; to confirm
                        </li>
                    </ol>
                ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                        Open your browser&apos;s menu and look for &ldquo;Install app&rdquo; or &ldquo;Add to Home Screen&rdquo;.
                    </p>
                )}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
