import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import * as notificationsRepo from "./notifications.repository";
import type { GetNotificationsQueryDto } from "./notifications.dto";

export const getMyNotifications = async (userId: string, query: GetNotificationsQueryDto) => {
  const params = getPaginationParams(query);

  const [notifications, total, unreadCount] = await Promise.all([
    notificationsRepo.findNotificationsByUser(userId, query, params.skip, params.limit),
    notificationsRepo.countNotificationsByUser(userId, query),
    notificationsRepo.countUnreadNotifications(userId),
  ]);

  return { 
    notifications, 
    meta: buildPaginationMeta(total, params),
    unreadCount 
  };
};

export const markAsRead = async (id: string, userId: string) => {
  await notificationsRepo.markAsRead(id, userId);
  return { success: true };
};

export const markAllAsRead = async (userId: string) => {
  await notificationsRepo.markAllAsRead(userId);
  return { success: true };
};
