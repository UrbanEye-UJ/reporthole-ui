"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptAssignment } from "@/app/api/generated/incidents/incidents";
import { getGetRecentIncidentsQueryKey } from "@/app/api/generated/incidents/incidents";
import { MY_ASSIGNMENTS_QUERY_KEY } from "@/lib/hooks/useMyAssignments";

/** Accepts an incident assignment, advancing it from ASSIGNED to IN_PROGRESS. */
export const useAcceptAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: string) => acceptAssignment(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: getGetRecentIncidentsQueryKey() });
    },
  });
};
