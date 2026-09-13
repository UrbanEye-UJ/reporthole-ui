"use client";

/**
 * Thin wrapper around the orval-generated useGetRecentIncidents hook.
 */

import {
  useGetRecentIncidents as useGetRecentIncidentsGenerated,
  getGetRecentIncidentsQueryKey,
} from "@/app/api/generated/incidents/incidents";
import type {
  IncidentResponseDTO,
  AppResponseListIncidentResponseDTO,
} from "@/app/api/generated/openAPIDefinition.schemas";

/** Union of all possible incident status strings — used throughout the admin and contractor UIs. */
export type AssignmentStatus = "REPORTED" | "VERIFIED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";

/** IncidentResponseDTO with status narrowed to AssignmentStatus for convenience. */
export type IncidentWithStatus = IncidentResponseDTO & { status?: AssignmentStatus };

export type AppResponseListIncidentWithStatus = Omit<AppResponseListIncidentResponseDTO, "data"> & {
  data?: IncidentWithStatus[];
};

export const getGetRecentIncidentsKey = (limit?: number) =>
  getGetRecentIncidentsQueryKey({ limit });

export const useGetRecentIncidents = (limit = 10) =>
  useGetRecentIncidentsGenerated(
    { limit },
    { query: { refetchInterval: 60_000 } },
  );
