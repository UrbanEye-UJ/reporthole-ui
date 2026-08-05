"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";

export interface IncidentStats {
  totalIncidents: number;
  resolvedIncidents: number;
}

interface AppResponseIncidentStats {
  data?: IncidentStats;
  message?: string;
  status?: number;
  timestamp?: string;
}

export const INCIDENT_STATS_QUERY_KEY = ["/incidents/stats"] as const;

// Hand-written to match the orval-generated hook shape — GET /incidents/stats
// isn't in the OpenAPI spec's generated client yet.
export const getIncidentStats = (signal?: AbortSignal) =>
  apiClient<AppResponseIncidentStats>({ url: "/incidents/stats", method: "GET", signal });

export const useGetIncidentStats = () =>
  useQuery({
    queryKey: INCIDENT_STATS_QUERY_KEY,
    queryFn: ({ signal }) => getIncidentStats(signal),
  });
