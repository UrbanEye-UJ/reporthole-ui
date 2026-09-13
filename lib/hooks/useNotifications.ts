"use client";

/**
 * Thin wrappers around orval-generated notification hooks.
 * Callers import from here so they stay decoupled from the generated path.
 */

import { useQueryClient } from "@tanstack/react-query";

import {
  useGetMyNotifications,
  useGetUnreadCount,
  useMarkAllRead,
  useMarkRead,
  getGetMyNotificationsQueryKey,
  getGetUnreadCountQueryKey,
} from "@/app/api/generated/notifications/notifications";
import type { NotificationResponse } from "@/app/api/generated/openAPIDefinition.schemas";

export type { NotificationResponse as NotificationItem };

/** Fetches the most recent notifications for the authenticated user. */
export function useNotifications() {
  return useGetMyNotifications({
    query: {
      select: (res) => res.data ?? [],
      staleTime: 30_000,
      refetchInterval: 60_000,
    },
  });
}

/** Returns the unread notification count — drives the bell badge. */
export function useUnreadNotificationCount() {
  return useGetUnreadCount({
    query: {
      select: (res) => res.data ?? 0,
      refetchInterval: 60_000,
    },
  });
}

/** Marks all unread notifications as read in one request. */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMarkAllRead({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMyNotificationsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetUnreadCountQueryKey() });
      },
    },
  });
}

/** Marks a single notification as read. */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMarkRead({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMyNotificationsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetUnreadCountQueryKey() });
      },
    },
  });
}

/** Returns a stable callback that re-fetches both notification queries — useful as an SSE event handler. */
export function useRefetchNotifications() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: getGetMyNotificationsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetUnreadCountQueryKey() });
  };
}
