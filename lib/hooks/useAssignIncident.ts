"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { assignIncident } from "@/app/api/generated/incidents/incidents";
import { getGetRecentIncidentsQueryKey } from "@/app/api/generated/incidents/incidents";
import { getGetContractorsQueryKey } from "@/app/api/generated/admin-contractors/admin-contractors";

/** Assigns an incident to a contractor. */
export const useAssignIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, contractorId }: { incidentId: string; contractorId: string }) =>
      assignIncident(incidentId, { contractorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetRecentIncidentsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetContractorsQueryKey() });
    },
  });
};
