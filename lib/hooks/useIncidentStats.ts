"use client";

/**
 * Thin wrapper around the orval-generated useGetIncidentStats hook.
 */

import {
  useGetIncidentStats as useGetIncidentStatsGenerated,
  getGetIncidentStatsQueryKey,
} from "@/app/api/generated/incidents/incidents";
import type { IncidentStatsDTO } from "@/app/api/generated/openAPIDefinition.schemas";

export type { IncidentStatsDTO as IncidentStats };

export const INCIDENT_STATS_QUERY_KEY = getGetIncidentStatsQueryKey();

export const useGetIncidentStats = () => useGetIncidentStatsGenerated();
