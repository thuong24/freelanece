import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { GetNotificationsQuerySchema } from "./notifications.dto";
import * as notificationsController from "./notifications.controller";

const router = Router();

router.use(requireAuth);

// GET /api/notifications — Lấy danh sách thông báo
router.get("/", validate(GetNotificationsQuerySchema, "query"), notificationsController.getMyNotifications);

// PATCH /api/notifications/read-all — Đánh dấu đọc tất cả
router.patch("/read-all", notificationsController.markAllAsRead);

// PATCH /api/notifications/:id/read — Đánh dấu đọc 1 thông báo
router.patch("/:id/read", notificationsController.markAsRead);

export default router;
