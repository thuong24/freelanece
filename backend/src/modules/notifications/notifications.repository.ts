import { prisma } from "../../config/prisma";
import type { GetNotificationsQueryDto } from "./notifications.dto";

export const findNotificationsByUser = (userId: string, query: GetNotificationsQueryDto, skip: number, take: number) => {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(query.isRead !== undefined && { isRead: query.isRead }),
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
};

export const countNotificationsByUser = (userId: string, query: GetNotificationsQueryDto) => {
  return prisma.notification.count({
    where: {
      userId,
      ...(query.isRead !== undefined && { isRead: query.isRead }),
    },
  });
};

export const countUnreadNotifications = (userId: string) => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};

export const markAsRead = (id: string, userId: string) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

export const markAllAsRead = (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
