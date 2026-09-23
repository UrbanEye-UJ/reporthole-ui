"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  verifyIncident,
  getGetRecentIncidentsQueryKey,
  getGetIncidentsPendingAiReviewQueryKey,
} from "@/app/api/generated/incidents/incidents";

/** Verifies an incident, advancing it from REPORTED to VERIFIED. */
export const useVerifyIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => verifyIncident(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetRecentIncidentsQueryKey() });
      // Also drops it off the AI Review Queue, if it was an AI-generated incident shown there.
      queryClient.invalidateQueries({ queryKey: getGetIncidentsPendingAiReviewQueryKey() });
    },
  });
};
