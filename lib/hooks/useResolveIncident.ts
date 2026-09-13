"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resolveIncident } from "@/app/api/generated/incidents/incidents";
import { getGetRecentIncidentsQueryKey } from "@/app/api/generated/incidents/incidents";
import { getGetContractorsQueryKey } from "@/app/api/generated/admin-contractors/admin-contractors";
import { getGetIncidentStatsQueryKey } from "@/app/api/generated/incidents/incidents";
import { MY_ASSIGNMENTS_QUERY_KEY } from "@/lib/hooks/useMyAssignments";

/** Resolves an IN_PROGRESS incident, advancing it to RESOLVED. */
export const useResolveIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      incidentId,
      note,
      photoBase64,
    }: {
      incidentId: string;
      note: string;
      photoBase64: string;
    }) => resolveIncident(incidentId, { note, photoBase64 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: getGetRecentIncidentsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetContractorsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetIncidentStatsQueryKey() });
    },
  });
};
