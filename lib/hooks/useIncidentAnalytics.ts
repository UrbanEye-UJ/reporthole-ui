"use client";

/**
 * Thin wrapper around the orval-generated useGetIncidentAnalytics hook.
 */

import {
  useGetIncidentAnalytics as useGetIncidentAnalyticsGenerated,
} from "@/app/api/generated/incidents/incidents";
import type { IncidentAnalyticsDTO } from "@/app/api/generated/openAPIDefinition.schemas";

export type { IncidentAnalyticsDTO as IncidentAnalytics };

/**
 * Fetches aggregated incident analytics for the analytics dashboard.
 * @param municipalityId ignored for ADMIN callers (their own municipality always wins);
 *   for SECURITY_ADMIN, filters to one municipality, or platform-wide when omitted.
 */
export const useGetIncidentAnalytics = (municipalityId?: string) =>
  useGetIncidentAnalyticsGenerated(
    { ...(municipalityId ? { municipalityId } : {}) },
    { query: { select: (res) => res.data } },
  );
