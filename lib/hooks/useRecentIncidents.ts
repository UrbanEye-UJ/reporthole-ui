"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";
import type {
  AppResponseListIncidentResponseDTO,
  IncidentResponseDTO,
} from "@/app/api/generated/openAPIDefinition.schemas";

export type AssignmentStatus = "REPORTED" | "VERIFIED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";

// The generated IncidentResponseDTO doesn't have `status` yet — it's a new backend field
// (derived from the incident's AssignmentWorkflow) not reflected in the OpenAPI spec until
// `npm run generate:api` is rerun. Extend it locally in the meantime.
export interface IncidentWithStatus extends IncidentResponseDTO {
  status?: AssignmentStatus;
}

export interface AppResponseListIncidentWithStatus extends Omit<AppResponseListIncidentResponseDTO, "data"> {
  data?: IncidentWithStatus[];
}

// Hand-written to match the orval-generated hook shape (see app/api/generated/incidents/incidents.ts).
// GET /incidents/recent isn't in the OpenAPI spec's generated client yet — once `npm run generate:api`
// is rerun against the updated backend, this can be replaced with a generated `useGetRecentIncidents`.
export const getRecentIncidents = (limit = 10, signal?: AbortSignal) =>
  apiClient<AppResponseListIncidentWithStatus>({
    url: "/incidents/recent",
    method: "GET",
    params: { limit },
    signal,
  });

export const useGetRecentIncidents = (limit = 10) =>
  useQuery({
    queryKey: ["/incidents/recent", limit] as const,
    queryFn: ({ signal }) => getRecentIncidents(limit, signal),
  });
