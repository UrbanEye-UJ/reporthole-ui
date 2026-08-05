"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";
import type { IncidentWithStatus } from "@/lib/hooks/useRecentIncidents";
import { MY_ASSIGNMENTS_QUERY_KEY } from "@/lib/hooks/useMyAssignments";

interface AppResponseIncidentWithStatus {
  data?: IncidentWithStatus;
  message?: string;
  status?: number;
  timestamp?: string;
}

// Hand-written to match the orval-generated hook shape — POST /incidents/{id}/accept
// isn't in the OpenAPI spec's generated client yet.
export const acceptAssignment = (incidentId: string) =>
  apiClient<AppResponseIncidentWithStatus>({
    url: `/incidents/${incidentId}/accept`,
    method: "POST",
  });

export const useAcceptAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => acceptAssignment(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["/incidents/recent"] });
    },
  });
};
