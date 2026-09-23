/**
 * Tests for lib/hooks/useOfflineSync.ts — replays queued offline mutations on mount and on
 * reconnect, except AUTO_LOG dashcam items (held for the dashcam page's own confirm UI).
 */

import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOfflineSync } from "@/lib/hooks/useOfflineSync";
import { enqueue, listQueued, count } from "@/lib/offlineQueue";

jest.mock("@/lib/axios", () => ({
    apiClient: jest.fn(),
}));

import { apiClient } from "@/lib/axios";
const mockApiClient = apiClient as jest.Mock;

function TestHarness() {
    useOfflineSync();
    return null;
}

function renderHarness() {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <TestHarness />
        </QueryClientProvider>
    );
}

beforeEach(async () => {
    mockApiClient.mockReset();
    mockApiClient.mockResolvedValue({});
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    const items = await listQueued();
    await Promise.all(items.map((i) => import("@/lib/offlineQueue").then((m) => m.remove(i.id))));
});

describe("useOfflineSync", () => {
    it("replays a queued jwt-authenticated mutation on mount and removes it on success", async () => {
        await enqueue({
            kind: "contractor-progress",
            url: "/incidents/1/progress",
            method: "POST",
            body: { note: "done" },
            authMode: "jwt",
        });

        renderHarness();

        await waitFor(async () => expect(await count()).toBe(0));
        expect(mockApiClient).toHaveBeenCalledWith(
            expect.objectContaining({ url: "/incidents/1/progress", method: "POST", data: { note: "done" } })
        );
    });

    it("attaches an Idempotency-Key header for contractor-* kinds", async () => {
        const item = await enqueue({
            kind: "contractor-resolve",
            url: "/incidents/1/resolve",
            method: "POST",
            body: { note: "x", photoBase64: "y" },
            authMode: "jwt",
        });

        renderHarness();

        await waitFor(() => expect(mockApiClient).toHaveBeenCalled());
        expect(mockApiClient).toHaveBeenCalledWith(
            expect.objectContaining({ headers: { "Idempotency-Key": item.id } })
        );
    });

    it("does not attach an Idempotency-Key header for civilian-report", async () => {
        await enqueue({
            kind: "civilian-report",
            url: "/incidents/create",
            method: "POST",
            body: { incidentType: "POTHOLE" },
            authMode: "jwt",
        });

        renderHarness();

        await waitFor(() => expect(mockApiClient).toHaveBeenCalled());
        expect(mockApiClient).toHaveBeenCalledWith(
            expect.objectContaining({ headers: undefined })
        );
    });

    it("replays a device-token dashcam-report via fetch with a bearer header", async () => {
        await enqueue({
            kind: "dashcam-report",
            url: "/incidents/create",
            method: "POST",
            body: { incidentType: "CRACK" },
            authMode: "device-token",
            deviceToken: "device-abc",
            dashcamDecision: "ESCALATE",
        });

        renderHarness();

        await waitFor(async () => expect(await count()).toBe(0));
        expect(global.fetch).toHaveBeenCalledWith(
            "/api/incidents/create",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({ Authorization: "Bearer device-abc" }),
            })
        );
    });

    it("does not replay an AUTO_LOG dashcam-report — leaves it queued for manual confirmation", async () => {
        await enqueue({
            kind: "dashcam-report",
            url: "/incidents/create",
            method: "POST",
            body: { incidentType: "POTHOLE" },
            authMode: "device-token",
            deviceToken: "device-abc",
            dashcamDecision: "AUTO_LOG",
        });

        renderHarness();

        // Give the effect a tick to run, then confirm nothing was sent and it's still queued.
        await new Promise((r) => setTimeout(r, 0));
        expect(global.fetch).not.toHaveBeenCalled();
        expect(await count()).toBe(1);
    });

    it("stops replaying (leaves the rest queued) on the first failure rather than hammering a down backend", async () => {
        await enqueue({ kind: "contractor-accept", url: "/incidents/1/accept", method: "POST", body: {}, authMode: "jwt" });
        await enqueue({ kind: "contractor-accept", url: "/incidents/2/accept", method: "POST", body: {}, authMode: "jwt" });
        mockApiClient.mockRejectedValue(Object.assign(new Error("Network Error"), { isAxiosError: true }));

        renderHarness();

        await waitFor(() => expect(mockApiClient).toHaveBeenCalledTimes(1));
        expect(await count()).toBe(2);
    });
});
