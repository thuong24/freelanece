import api from "./axios";
import type { Notification } from "@/lib/types/notification.types";
import type { ApiResponse, PaginationMeta } from "@/lib/types/api.types";

export const notificationsApi = {
  getNotifications: (params?: { page?: number; limit?: number; isRead?: boolean }) =>
    api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }> & { meta: PaginationMeta }>("/notifications", { params }),

  markAsRead: (id: string) =>
    api.patch<ApiResponse<null>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch<ApiResponse<null>>("/notifications/read-all"),
};
