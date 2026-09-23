import { defaultShouldDehydrateQuery, type Query } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { Persister } from "@tanstack/react-query-persist-client";

// Query-key path fragments that must never be written to localStorage: PII reveals
// (currently mutation-only, not cached — excluded anyway as a defensive backstop against a
// future GET-based reveal), unread notification state (misleading to show back stale after
// being offline), and any live event-stream endpoint (not a plain cacheable JSON response).
const EXCLUDED_QUERY_KEY_SUBSTRINGS = ["reveal", "notifications", "/events"];

export function shouldPersistQuery(query: Query): boolean {
    if (!defaultShouldDehydrateQuery(query)) return false;
    const key = query.queryKey[0];
    if (typeof key !== "string") return true;
    return !EXCLUDED_QUERY_KEY_SUBSTRINGS.some((fragment) => key.includes(fragment));
}

const noopPersister: Persister = {
    persistClient: async () => {},
    restoreClient: async () => undefined,
    removeClient: async () => {},
};

/**
 * localStorage-backed persister for a role's QueryClient. Guarded for SSR — `window` is
 * undefined while this runs on the server, so a no-op stand-in is used there; it's never
 * actually invoked server-side since persistence only kicks in via a client-side effect.
 */
export function createQueryPersister(storageKey: string): Persister {
    if (typeof window === "undefined") return noopPersister;
    return createSyncStoragePersister({ storage: window.localStorage, key: storageKey });
}
