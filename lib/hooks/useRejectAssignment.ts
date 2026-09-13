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

interface RejectAssignmentInput {
  incidentId: string;
  reason: string;
}

// Hand-written to match the orval-generated hook shape — POST /incidents/{id}/reject
// isn't in the OpenAPI spec's generated client yet.
export const rejectAssignment = ({ incidentId, reason }: RejectAssignmentInput) =>
  apiClient<AppResponseIncidentWithStatus>({
    url: `/incidents/${incidentId}/reject`,
    method: "POST",
    data: { reason },
  });

export const useRejectAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RejectAssignmentInput) => rejectAssignment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["/incidents/recent"] });
    },
  });
};
