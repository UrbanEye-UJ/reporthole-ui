"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reopenIncident } from "@/app/api/generated/incidents/incidents";
import { getGetRecentIncidentsQueryKey } from "@/app/api/generated/incidents/incidents";

/** Reverts a RESOLVED incident to VERIFIED so it can be reassigned. */
export const useReopenIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => reopenIncident(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetRecentIncidentsQueryKey() });
    },
  });
};
