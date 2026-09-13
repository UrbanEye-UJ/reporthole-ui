"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";

export interface EscalatedFrameDTO {
  frameId: string;
  label: string | null;
  confidence: number;
  createdAt: string;
  imageBase64: string | null;
}

interface AppResponseList<T> {
  data: T[];
  message: string;
  status: number;
}

export const ESCALATED_FRAMES_QUERY_KEY = ["/inference/escalated"] as const;

const fetchEscalatedFrames = () =>
  apiClient<AppResponseList<EscalatedFrameDTO>>({ url: "/inference/escalated", method: "GET" });

const approveFrame = (frameId: string) =>
  apiClient<void>({ url: `/inference/escalated/${frameId}/approve`, method: "POST" });

const discardFrame = (frameId: string) =>
  apiClient<void>({ url: `/inference/escalated/${frameId}/discard`, method: "POST" });

/** Fetches the list of ESCALATE-tier frames awaiting admin review. */
export const useEscalatedFrames = () =>
  useQuery({
    queryKey: ESCALATED_FRAMES_QUERY_KEY,
    queryFn: fetchEscalatedFrames,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

/** Approves a frame (creates an incident) and refetches the queue. */
export const useApproveFrame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (frameId: string) => approveFrame(frameId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ESCALATED_FRAMES_QUERY_KEY }),
  });
};

/** Discards a frame and refetches the queue. */
export const useDiscardFrame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (frameId: string) => discardFrame(frameId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ESCALATED_FRAMES_QUERY_KEY }),
  });
};
