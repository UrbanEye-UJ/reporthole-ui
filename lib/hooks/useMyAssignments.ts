"use client";

/**
 * Thin wrapper around the orval-generated useGetMyAssignments hook.
 */

import {
  useGetMyAssignments as useGetMyAssignmentsGenerated,
  getGetMyAssignmentsQueryKey,
} from "@/app/api/generated/incidents/incidents";

export const MY_ASSIGNMENTS_QUERY_KEY = getGetMyAssignmentsQueryKey();

/** Returns all incidents currently assigned to the authenticated contractor. */
export const useGetMyAssignments = () =>
  useGetMyAssignmentsGenerated({ query: { refetchInterval: 60_000 } });
