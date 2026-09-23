"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Wraps the browser's `beforeinstallprompt` flow. Not fired at all on Safari/iOS
 * (no such event there) — `canInstall` simply stays false on those browsers, no
 * fallback UI is offered.
 */
export function useInstallPrompt() {
    const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsStandalone(
            window.matchMedia("(display-mode: standalone)").matches ||
            (navigator as unknown as { standalone?: boolean }).standalone === true
        );

        const onBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredEvent(e as BeforeInstallPromptEvent);
        };
        const onInstalled = () => {
            setDeferredEvent(null);
            setIsStandalone(true);
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstall);
        window.addEventListener("appinstalled", onInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstall);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        if (!deferredEvent) return;
        await deferredEvent.prompt();
        await deferredEvent.userChoice;
        setDeferredEvent(null);
    }, [deferredEvent]);

    return { canInstall: !!deferredEvent && !isStandalone, isStandalone, promptInstall };
}
