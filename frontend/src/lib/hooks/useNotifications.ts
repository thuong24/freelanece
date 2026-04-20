"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";
import { notificationsApi } from "@/lib/api/notifications.api";
import { useNotificationStore } from "@/lib/stores/notification.store";

export const useNotifications = (filters?: object) =>
  useQuery({
    queryKey: QUERY_KEYS.notifications(filters),
    queryFn: async () => {
      const res = await notificationsApi.getNotifications(filters as any);
      const { setUnreadCount } = useNotificationStore.getState();
      setUnreadCount(res.data.data.unreadCount);
      return res.data;
    },
    refetchInterval: 60000, // Poll mỗi 60s
  });

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  const { decrementUnread } = useNotificationStore();
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      decrementUnread();
    },
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  const { clearUnread } = useNotificationStore();
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      clearUnread();
    },
  });
};
