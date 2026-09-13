"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { verifyIncident } from "@/app/api/generated/incidents/incidents";
import { getGetRecentIncidentsQueryKey } from "@/app/api/generated/incidents/incidents";

/** Verifies an incident, advancing it from REPORTED to VERIFIED. */
export const useVerifyIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => verifyIncident(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetRecentIncidentsQueryKey() });
    },
  });
};
