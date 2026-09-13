"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rejectAssignment } from "@/app/api/generated/incidents/incidents";
import { getGetRecentIncidentsQueryKey } from "@/app/api/generated/incidents/incidents";
import { MY_ASSIGNMENTS_QUERY_KEY } from "@/lib/hooks/useMyAssignments";

/** Rejects a contractor's assignment, returning the incident to VERIFIED. */
export const useRejectAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, reason }: { incidentId: string; reason: string }) =>
      rejectAssignment(incidentId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: getGetRecentIncidentsQueryKey() });
    },
  });
};
