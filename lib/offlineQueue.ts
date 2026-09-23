"use client";

/**
 * IndexedDB-backed queue for "field" mutations (report an issue, resolve a job, etc.) that
 * fail because the device is offline. Deliberately separate from react-query's own cache
 * persistence (Part 3 / `lib/queryPersist.ts`) — this stores outgoing writes, not cached reads,
 * and can hold a base64 photo, which localStorage's much smaller quota isn't a good fit for.
 *
 * Only ever written to by the six call sites listed in the offline-support plan; read and
 * replayed by `lib/hooks/useOfflineSync.ts`.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type QueuedMutationKind =
    | "civilian-report"
    | "dashcam-report"
    | "contractor-resolve"
    | "contractor-progress"
    | "contractor-reject"
    | "contractor-accept";

export interface QueuedMutation {
    /** Client-generated UUID — also sent as the `Idempotency-Key` header when replaying a `contractor-*` kind. */
    id: string;
    kind: QueuedMutationKind;
    /** Relative to the API base, e.g. "/incidents/create", "/incidents/{id}/resolve" (already interpolated). */
    url: string;
    method: "POST";
    /** The exact JSON payload already being sent today for this kind. */
    body: unknown;
    authMode: "jwt" | "device-token";
    /** Only set for "dashcam-report" — the sync manager can't read this from a cookie the way JWT replays can. */
    deviceToken?: string;
    /**
     * Only meaningful for "dashcam-report": which routing decision produced this item. Both
     * tiers are held for a retry-send tap on reconnect instead of auto-replaying — see
     * `useOfflineSync.ts`.
     */
    dashcamDecision?: "AUTO_LOG" | "ESCALATE";
    createdAt: string;
}

interface OfflineQueueDB extends DBSchema {
    "queued-mutations": {
        key: string;
        value: QueuedMutation;
    };
}

const DB_NAME = "reporthole-offline-queue";
const DB_VERSION = 1;
const STORE_NAME = "queued-mutations";

let dbPromise: Promise<IDBPDatabase<OfflineQueueDB>> | null = null;

function getDb() {
    if (!dbPromise) {
        dbPromise = openDB<OfflineQueueDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            },
        });
    }
    return dbPromise;
}

/**
 * Queues a mutation for later replay. Generates `createdAt`; generates `id` too unless the
 * caller supplies one (the dashcam page reuses its own event id, so a later confirm/replay of
 * the same logical detection overwrites rather than duplicates the queued entry — `put` is an
 * upsert).
 */
export async function enqueue(item: Omit<QueuedMutation, "id" | "createdAt"> & { id?: string }): Promise<QueuedMutation> {
    const full: QueuedMutation = {
        ...item,
        id: item.id ?? crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    const db = await getDb();
    await db.put(STORE_NAME, full);
    return full;
}

export async function listQueued(): Promise<QueuedMutation[]> {
    const db = await getDb();
    return db.getAll(STORE_NAME);
}

export async function remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
}

export async function count(): Promise<number> {
    const db = await getDb();
    return db.count(STORE_NAME);
}

/**
 * True for a failure that means "the request never reached the server" — the case that should
 * be queued. False for anything the server actually responded to (a 4xx/5xx, a validation
 * error) — those should surface to the user exactly as they do today, not be silently retried.
 */
export function isNetworkError(err: unknown): boolean {
    // axios: a request with no response at all (network down, DNS failure, CORS, timeout).
    if (err && typeof err === "object" && "isAxiosError" in err) {
        return !(err as { response?: unknown }).response;
    }
    // raw fetch (dashcam page): a network failure throws a TypeError before any Response exists.
    if (err instanceof TypeError) {
        return true;
    }
    return false;
}
