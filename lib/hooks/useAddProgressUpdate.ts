"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addProgressUpdate } from "@/app/api/generated/incidents/incidents";
import { getGetRecentIncidentsQueryKey } from "@/app/api/generated/incidents/incidents";
import { MY_ASSIGNMENTS_QUERY_KEY } from "@/lib/hooks/useMyAssignments";

/** Posts a progress note while an incident is IN_PROGRESS. */
export const useAddProgressUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, note }: { incidentId: string; note: string }) =>
      addProgressUpdate(incidentId, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: getGetRecentIncidentsQueryKey() });
    },
  });
};
