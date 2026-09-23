"use client";

/**
 * Replays queued offline mutations (see `lib/offlineQueue.ts`) once connectivity returns.
 * Mount once per role (civilian, contractor) — see `_providers.tsx` in each route group.
 *
 * AUTO_LOG dashcam items are the one exception: they were never human-reviewed before being
 * queued (unlike everything else here, which the user already actively decided to submit), so
 * they're left queued for the dashcam page itself to surface as a confirm-before-send prompt —
 * see `dashcam/page.tsx`. Every other kind replays automatically.
 */

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { listQueued, remove, type QueuedMutation } from "@/lib/offlineQueue";
import { apiClient } from "@/lib/axios";

const QUEUE_CHANGED_EVENT = "offline-queue-changed";

export function dispatchQueueChanged(count: number) {
    window.dispatchEvent(new CustomEvent(QUEUE_CHANGED_EVENT, { detail: { count } }));
}

export function useOfflineSync() {
    const queryClient = useQueryClient();

    const sync = useCallback(async () => {
        const queued = await listQueued();
        let replayedAny = false;

        for (const item of queued) {
            // AUTO_LOG items were never reviewed before queueing — hold them for the dashcam
            // page's own confirm-before-send UI instead of silently replaying.
            if (item.kind === "dashcam-report" && item.dashcamDecision === "AUTO_LOG") {
                continue;
            }

            try {
                if (item.authMode === "device-token") {
                    const res = await fetch(`/api${item.url}`, {
                        method: item.method,
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${item.deviceToken}`,
                        },
                        body: JSON.stringify(item.body),
                    });
                    if (!res.ok) {
                        // Server actually rejected it (or the token's gone bad) — drop it rather
                        // than retrying forever; the user already saw a queued confirmation, not
                        // a promise this would eventually succeed no matter what.
                        await remove(item.id);
                        continue;
                    }
                } else {
                    await apiClient({
                        url: item.url,
                        method: item.method,
                        data: item.body,
                        headers: isIdempotent(item.kind) ? { "Idempotency-Key": item.id } : undefined,
                    });
                }
                await remove(item.id);
                replayedAny = true;
            } catch {
                // Still offline (or the backend is down) — stop here, leave this and the rest
                // queued, try again on the next "online" event rather than hammering it.
                break;
            }
        }

        if (replayedAny) {
            queryClient.invalidateQueries();
        }
        dispatchQueueChanged((await listQueued()).length);
    }, [queryClient]);

    useEffect(() => {
        sync();
        window.addEventListener("online", sync);
        return () => window.removeEventListener("online", sync);
    }, [sync]);
}

function isIdempotent(kind: QueuedMutation["kind"]) {
    return kind === "contractor-resolve" || kind === "contractor-progress"
        || kind === "contractor-reject" || kind === "contractor-accept";
}
