"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorRole: string;
}

const commentsKey = (incidentId: string) => [`/incidents/${incidentId}/comments`];

const fetchComments = (incidentId: string) =>
  apiClient<{ data: CommentResponse[] }>({
    url: `/incidents/${incidentId}/comments`,
    method: "GET",
  });

const postComment = (incidentId: string, content: string) =>
  apiClient<{ data: CommentResponse }>({
    url: `/incidents/${incidentId}/comments`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { content },
  });

/** Fetches comments for a given incident, oldest first. */
export const useGetIncidentComments = (incidentId: string | undefined) =>
  useQuery({
    queryKey: commentsKey(incidentId ?? ""),
    queryFn: () => fetchComments(incidentId!),
    enabled: !!incidentId,
    select: (res) => res.data?.data ?? [],
  });

/** Posts a new comment on an incident and invalidates the comment list. */
export const usePostIncidentComment = (incidentId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => postComment(incidentId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(incidentId ?? "") });
    },
  });
};
