/**
 * Tests for lib/queryPersist.ts — the localStorage-persister wiring shared by the three
 * QueryClient instances (civilian+contractor, admin, security), and its query-key filter
 * that keeps PII-adjacent/notification/event-stream data out of localStorage.
 */

import { QueryClient, type Query } from "@tanstack/react-query";

import { createQueryPersister, shouldPersistQuery } from "@/lib/queryPersist";

function makeQuery(queryKey: readonly unknown[], status: "success" | "pending" | "error" = "success"): Query {
    const client = new QueryClient();
    const query = client.getQueryCache().build(client, { queryKey });
    if (status === "success") {
        query.setState({ status: "success", data: {}, error: null, dataUpdatedAt: Date.now() });
    } else if (status === "error") {
        query.setState({ status: "error", error: new Error("boom") });
    }
    return query;
}

describe("shouldPersistQuery", () => {
    it("persists an ordinary successful query", () => {
        expect(shouldPersistQuery(makeQuery(["/incidents/my"]))).toBe(true);
    });

    it("excludes reveal-flavored query keys", () => {
        expect(shouldPersistQuery(makeQuery(["/admin/contractors/reveal-email"]))).toBe(false);
    });

    it("excludes notifications query keys", () => {
        expect(shouldPersistQuery(makeQuery(["/notifications"]))).toBe(false);
    });

    it("excludes event-stream query keys", () => {
        expect(shouldPersistQuery(makeQuery(["/incidents/events"]))).toBe(false);
    });

    it("excludes a query that hasn't succeeded yet", () => {
        expect(shouldPersistQuery(makeQuery(["/incidents/my"], "error"))).toBe(false);
    });

    it("persists non-string query keys unfiltered by substring matching", () => {
        expect(shouldPersistQuery(makeQuery([{ scope: "incidents" }]))).toBe(true);
    });
});

describe("createQueryPersister", () => {
    // persistClient is internally throttled (1s default) rather than writing synchronously,
    // so fake timers are needed to observe the write without slowing the test down for real.
    it("returns a working persister backed by localStorage in a browser-like environment", async () => {
        jest.useFakeTimers();
        try {
            const persister = createQueryPersister("test-query-cache-key");
            persister.persistClient({ timestamp: Date.now(), buster: "", clientState: { queries: [], mutations: [] } });
            jest.advanceTimersByTime(1000);
            expect(localStorage.getItem("test-query-cache-key")).toBeTruthy();

            const restored = await persister.restoreClient();
            expect(restored?.clientState).toEqual({ queries: [], mutations: [] });

            await persister.removeClient();
            expect(localStorage.getItem("test-query-cache-key")).toBeNull();
        } finally {
            jest.useRealTimers();
        }
    });
});
