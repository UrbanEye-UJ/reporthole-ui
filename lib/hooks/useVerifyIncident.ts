"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";
import type { IncidentWithStatus } from "@/lib/hooks/useRecentIncidents";

interface AppResponseIncidentWithStatus {
  data?: IncidentWithStatus;
  message?: string;
  status?: number;
  timestamp?: string;
}

// Hand-written to match the orval-generated hook shape — POST /incidents/{id}/verify
// isn't in the OpenAPI spec's generated client yet.
export const verifyIncident = (incidentId: string) =>
  apiClient<AppResponseIncidentWithStatus>({
    url: `/incidents/${incidentId}/verify`,
    method: "POST",
  });

export const useVerifyIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => verifyIncident(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/incidents/recent"] });
    },
  });
};
