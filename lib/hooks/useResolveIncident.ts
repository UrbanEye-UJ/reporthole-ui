"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";
import type { IncidentWithStatus } from "@/lib/hooks/useRecentIncidents";
import { MY_ASSIGNMENTS_QUERY_KEY } from "@/lib/hooks/useMyAssignments";
import { CONTRACTORS_QUERY_KEY } from "@/lib/hooks/useContractors";
import { INCIDENT_STATS_QUERY_KEY } from "@/lib/hooks/useIncidentStats";

interface ResolveIncidentRequest {
  note: string;
  photoBase64: string;
}

interface AppResponseIncidentWithStatus {
  data?: IncidentWithStatus;
  message?: string;
  status?: number;
  timestamp?: string;
}

// Hand-written to match the orval-generated hook shape — POST /incidents/{id}/resolve
// isn't in the OpenAPI spec's generated client yet.
export const resolveIncident = (incidentId: string, data: ResolveIncidentRequest) =>
  apiClient<AppResponseIncidentWithStatus>({
    url: `/incidents/${incidentId}/resolve`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data,
  });

export const useResolveIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, note, photoBase64 }: { incidentId: string; note: string; photoBase64: string }) =>
      resolveIncident(incidentId, { note, photoBase64 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["/incidents/recent"] });
      queryClient.invalidateQueries({ queryKey: CONTRACTORS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INCIDENT_STATS_QUERY_KEY });
    },
  });
};
