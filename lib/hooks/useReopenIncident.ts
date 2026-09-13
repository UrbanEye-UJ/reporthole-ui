"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";
import type { IncidentWithStatus } from "@/lib/hooks/useRecentIncidents";

interface AppResponseIncidentWithStatus {
    data?: IncidentWithStatus;
    message?: string;
    status?: number;
    timestamp?: string;
}

// Hand-written to match the orval-generated hook shape — POST /incidents/{id}/reopen
export const reopenIncident = (incidentId: string) =>
    apiClient<AppResponseIncidentWithStatus>({
        url: `/incidents/${incidentId}/reopen`,
        method: "POST",
    });

export const useReopenIncident = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (incidentId: string) => reopenIncident(incidentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/incidents/recent"] });
        },
    });
};
