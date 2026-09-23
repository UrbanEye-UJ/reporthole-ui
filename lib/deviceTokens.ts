// Hand-written companion to app/api/generated/devices/devices.ts.
//
// GET /devices doesn't have a generated hook yet because orval regenerates
// from the live backend's OpenAPI spec (`npm run generate:api`), and the
// endpoint was added without running the backend in this environment. The
// endpoint IS documented with SpringDoc annotations on DeviceController, so
// running `npm run generate:api` against a running backend will produce a
// proper generated hook — delete this file and switch callers over to it
// when that happens.

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./axios";

export interface DeviceSummaryResponse {
    deviceId: string;
    /** Last 8 characters of the token, e.g. "····a1b2c3d4". The full token is never returned again. */
    tokenPreview: string;
    createdAt: string;
}

interface AppResponseListDeviceSummaryResponse {
    data: DeviceSummaryResponse[];
    message?: string;
    status?: number;
}

export const listDevices = (signal?: AbortSignal) =>
    apiClient<AppResponseListDeviceSummaryResponse>({ url: "/devices", method: "GET", signal });

export const useListDevices = () =>
    useQuery({
        queryKey: ["devices"],
        queryFn: ({ signal }) => listDevices(signal),
    });
