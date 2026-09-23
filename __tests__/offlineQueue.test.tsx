/**
 * Tests for lib/offlineQueue.ts — the IndexedDB-backed queue for field mutations that fail
 * while offline. Uses fake-indexeddb (see jest.setup.ts) rather than mocking IndexedDB by hand.
 */

import { enqueue, listQueued, remove, count, isNetworkError } from "@/lib/offlineQueue";

describe("offlineQueue", () => {
    afterEach(async () => {
        const items = await listQueued();
        await Promise.all(items.map((i) => remove(i.id)));
    });

    it("enqueues an item, generating an id and createdAt when not supplied", async () => {
        const item = await enqueue({
            kind: "civilian-report",
            url: "/incidents/create",
            method: "POST",
            body: { incidentType: "POTHOLE" },
            authMode: "jwt",
        });

        expect(item.id).toBeTruthy();
        expect(item.createdAt).toBeTruthy();
        expect(await count()).toBe(1);
    });

    it("reuses a supplied id instead of generating one", async () => {
        const item = await enqueue({
            id: "fixed-id",
            kind: "dashcam-report",
            url: "/incidents/create",
            method: "POST",
            body: {},
            authMode: "device-token",
            deviceToken: "tok",
        });

        expect(item.id).toBe("fixed-id");
    });

    it("upserts on a repeated id rather than creating a duplicate row", async () => {
        await enqueue({ id: "same-id", kind: "contractor-accept", url: "/incidents/1/accept", method: "POST", body: {}, authMode: "jwt" });
        await enqueue({ id: "same-id", kind: "contractor-accept", url: "/incidents/1/accept", method: "POST", body: { retried: true }, authMode: "jwt" });

        expect(await count()).toBe(1);
        const [only] = await listQueued();
        expect(only.body).toEqual({ retried: true });
    });

    it("removes an item by id", async () => {
        const item = await enqueue({ kind: "contractor-progress", url: "/incidents/1/progress", method: "POST", body: { note: "x" }, authMode: "jwt" });
        expect(await count()).toBe(1);

        await remove(item.id);

        expect(await count()).toBe(0);
    });

    describe("isNetworkError", () => {
        it("is true for an axios error with no response (the request never reached the server)", () => {
            const err = Object.assign(new Error("Network Error"), { isAxiosError: true });
            expect(isNetworkError(err)).toBe(true);
        });

        it("is false for an axios error that has a response (the server actually replied)", () => {
            const err = Object.assign(new Error("Bad Request"), { isAxiosError: true, response: { status: 400 } });
            expect(isNetworkError(err)).toBe(false);
        });

        it("is true for a raw TypeError (fetch's network-failure signature)", () => {
            expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
        });

        it("is false for a plain Error", () => {
            expect(isNetworkError(new Error("something else"))).toBe(false);
        });
    });
});
