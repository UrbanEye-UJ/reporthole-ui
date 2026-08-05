"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";
import type { IncidentWithStatus } from "@/lib/hooks/useRecentIncidents";
import { CONTRACTORS_QUERY_KEY } from "@/lib/hooks/useContractors";

interface AssignIncidentRequest {
  contractorId: string;
}

interface AppResponseIncidentWithStatus {
  data?: IncidentWithStatus;
  message?: string;
  status?: number;
  timestamp?: string;
}

// Hand-written to match the orval-generated hook shape — POST /incidents/{id}/assign
// isn't in the OpenAPI spec's generated client yet.
export const assignIncident = (incidentId: string, data: AssignIncidentRequest) =>
  apiClient<AppResponseIncidentWithStatus>({
    url: `/incidents/${incidentId}/assign`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data,
  });

export const useAssignIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, contractorId }: { incidentId: string; contractorId: string }) =>
      assignIncident(incidentId, { contractorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/incidents/recent"] });
      queryClient.invalidateQueries({ queryKey: CONTRACTORS_QUERY_KEY });
    },
  });
};
