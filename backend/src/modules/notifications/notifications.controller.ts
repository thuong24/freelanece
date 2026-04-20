import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as notificationsService from "./notifications.service";
import type { GetNotificationsQueryDto } from "./notifications.dto";

// GET /api/notifications
export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetNotificationsQueryDto;
  const { notifications, meta, unreadCount } = await notificationsService.getMyNotifications(req.user!.id, query);
  
  return successResponse(
    res, 
    "Lấy danh sách thông báo thành công", 
    { notifications, unreadCount }, 
    200, 
    meta
  );
});

// PATCH /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationsService.markAsRead(req.params.id, req.user!.id);
  return successResponse(res, "Đã đánh dấu đọc thông báo");
});

// PATCH /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationsService.markAllAsRead(req.user!.id);
  return successResponse(res, "Đã đánh dấu đọc tất cả thông báo");
});
