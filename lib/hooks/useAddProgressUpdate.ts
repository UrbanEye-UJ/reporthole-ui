"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";
import { MY_ASSIGNMENTS_QUERY_KEY } from "@/lib/hooks/useMyAssignments";

const addProgressUpdate = (incidentId: string, note: string) =>
  apiClient<unknown>({
    url: `/incidents/${incidentId}/progress`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { note },
  });

export const useAddProgressUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, note }: { incidentId: string; note: string }) =>
      addProgressUpdate(incidentId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ASSIGNMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["/incidents/recent"] });
    },
  });
};
