"use client";

/**
 * Manual hooks for the notification API.
 * Replace with orval-generated hooks after running `npx orval` once the BE is running.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";


export interface NotificationItem {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AppResponse<T> {
  data: T;
}

const NOTIFICATIONS_KEY = ["notifications"] as const;
const UNREAD_COUNT_KEY = ["notifications", "unread-count"] as const;

/** Fetches the 50 most recent notifications for the authenticated user. */
export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () =>
      apiClient<AppResponse<NotificationItem[]>>({ method: "GET", url: "/notifications" }),
    select: (res) => res.data,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Returns the unread notification count — drives the bell badge. */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: () =>
      apiClient<AppResponse<number>>({ method: "GET", url: "/notifications/unread-count" }),
    select: (res) => res.data,
    refetchInterval: 60_000,
  });
}

/** Marks all unread notifications as read in one request. */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<void>({ method: "POST", url: "/notifications/read-all" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

/** Marks a single notification as read. */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>({ method: "POST", url: `/notifications/${id}/read` }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

/**
 * Invalidates both notification queries — call this when the SSE fires a `notification` event
 * so the badge and drawer refresh without a full page reload.
 */
export function useRefetchNotifications() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
  };
}
