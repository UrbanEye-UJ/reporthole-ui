"use client";

/**
 * Thin wrappers around the orval-generated training hooks (security-admin only), plus a manual
 * YOLO export download (the generated `exportYolo` types its response as `string`, which is
 * wrong for a binary zip — orval has no way to know the response is a file download from the
 * OpenAPI spec).
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  useGetAnnotations as useGetAnnotationsGenerated,
  useSaveAnnotations as useSaveAnnotationsGenerated,
  useDeleteAnnotation as useDeleteAnnotationGenerated,
  useFlagForTraining as useFlagForTrainingGenerated,
  getGetAnnotationsQueryKey,
} from "@/app/api/generated/training/training";
import { getSearchIncidentsQueryKey } from "@/app/api/generated/incidents/incidents";
import { apiClient } from "@/lib/axios";

export const useGetAnnotations = (incidentId: string | undefined) =>
  useGetAnnotationsGenerated(incidentId ?? "", { query: { enabled: !!incidentId } });

export const useSaveAnnotations = (incidentId: string | undefined) => {
  const queryClient = useQueryClient();
  return useSaveAnnotationsGenerated({
    mutation: {
      onSuccess: () => {
        if (incidentId) queryClient.invalidateQueries({ queryKey: getGetAnnotationsQueryKey(incidentId) });
      },
    },
  });
};

export const useDeleteAnnotation = (incidentId: string | undefined) => {
  const queryClient = useQueryClient();
  return useDeleteAnnotationGenerated({
    mutation: {
      onSuccess: () => {
        if (incidentId) queryClient.invalidateQueries({ queryKey: getGetAnnotationsQueryKey(incidentId) });
      },
    },
  });
};

/** Flags/un-flags an incident for training; also refreshes the incidents list so its status chip stays in sync. */
export const useFlagForTraining = () => {
  const queryClient = useQueryClient();
  return useFlagForTrainingGenerated({
    mutation: {
      onSuccess: () => {
        // Partial match: invalidates every page/filter combination of the security incidents
        // search, not just the one the caller happens to have open.
        queryClient.invalidateQueries({ queryKey: getSearchIncidentsQueryKey() });
      },
    },
  });
};

/** Downloads the YOLO dataset zip of every flagged incident and saves it via the browser. */
export const useExportYoloDataset = () =>
  useMutation({
    mutationFn: async (since?: string) => {
      const blob = await apiClient<Blob>({
        url: "/admin/training/export/yolo",
        method: "GET",
        params: since ? { since } : undefined,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporthole-yolo-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
