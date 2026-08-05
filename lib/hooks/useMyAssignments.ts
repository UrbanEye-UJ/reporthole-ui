"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";
import type { AppResponseListIncidentWithStatus } from "@/lib/hooks/useRecentIncidents";

export const MY_ASSIGNMENTS_QUERY_KEY = ["/incidents/my-assignments"] as const;

// Hand-written to match the orval-generated hook shape — GET /incidents/my-assignments
// isn't in the OpenAPI spec's generated client yet.
export const getMyAssignments = (signal?: AbortSignal) =>
  apiClient<AppResponseListIncidentWithStatus>({ url: "/incidents/my-assignments", method: "GET", signal });

export const useGetMyAssignments = () =>
  useQuery({
    queryKey: MY_ASSIGNMENTS_QUERY_KEY,
    queryFn: ({ signal }) => getMyAssignments(signal),
  });
