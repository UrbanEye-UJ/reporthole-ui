"use client";

/**
 * Thin wrapper around the orval-generated useGetIncidentClusters hook.
 */

import {
  useGetIncidentClusters as useGetIncidentClustersGenerated,
} from "@/app/api/generated/incidents/incidents";
import type { IncidentClusterDTO } from "@/app/api/generated/openAPIDefinition.schemas";

export type { IncidentClusterDTO as IncidentCluster };

/**
 * Fetches K-means incident clusters. k defaults to 5.
 * @param municipalityId when provided, restricts clustering to that municipality — used by
 *   the SECURITY_ADMIN map view.
 */
export const useGetIncidentClusters = (k = 5, type?: string, municipalityId?: string) =>
  useGetIncidentClustersGenerated(
    { k, ...(type ? { type: type as never } : {}), ...(municipalityId ? { municipalityId } : {}) },
    {
      query: {
        select: (res) => res.data ?? [],
        refetchInterval: 60_000,
      },
    },
  );
