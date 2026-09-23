"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * True on iPhone/iPad in any browser — iOS forces every browser (Chrome, Firefox, Edge
 * included) onto Safari's WebKit engine, so none of them expose `beforeinstallprompt` either.
 * iPadOS 13+ reports its platform as "MacIntel" (masquerading as desktop Safari), hence the
 * touch-points check alongside the user-agent one.
 */
function detectIOS(): boolean {
    if (typeof navigator === "undefined") return false;
    const isIOSUserAgent = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return isIOSUserAgent || isIPadOS;
}

/**
 * Wraps the browser's `beforeinstallprompt` flow. Not fired at all on iOS (no browser there
 * exposes it, see {@link detectIOS}) — `canInstall` simply stays false there; callers should
 * check `isIOS` to offer manual "Add to Home Screen" instructions instead.
 */
export function useInstallPrompt() {
    const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsStandalone(
            window.matchMedia("(display-mode: standalone)").matches ||
            (navigator as unknown as { standalone?: boolean }).standalone === true
        );
        setIsIOS(detectIOS());

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

    return { canInstall: !!deferredEvent && !isStandalone, isStandalone, isIOS, promptInstall };
}
