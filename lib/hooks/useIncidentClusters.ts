"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

export interface IncidentCluster {
    clusterIndex: number;
    centroidLatitude: number;
    centroidLongitude: number;
    /** Number of incidents in this cluster. */
    size: number;
    incidentIds: string[];
}

interface AppResponse<T> {
    data?: T;
}

// Hand-written to match the orval-generated hook shape — GET /incidents/clusters.
export const useGetIncidentClusters = (k = 5, type?: string) =>
    useQuery({
        queryKey: ["/incidents/clusters", k, type] as const,
        queryFn: () =>
            apiClient<AppResponse<IncidentCluster[]>>({
                url: "/incidents/clusters",
                method: "GET",
                params: { k, ...(type ? { type } : {}) },
            }),
        select: (res) => res.data ?? [],
        refetchInterval: 60_000,
    });
