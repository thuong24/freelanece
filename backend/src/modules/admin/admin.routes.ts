import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { requireAdmin } from "../../common/middlewares/admin.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { GetUsersQuerySchema, UpdateUserStatusSchema, LockFeatureSchema } from "./admin.dto";
import * as adminController from "./admin.controller";

const router = Router();

// Bắt buộc đăng nhập và phải là ADMIN cho toàn bộ module này
router.use(requireAuth, requireAdmin);

// ── Quản lý User ────────────────────────────────────────────

// Lấy danh sách user
router.get("/users", validate(GetUsersQuerySchema, "query"), adminController.getUsers);

// Khóa/Mở khóa tài khoản (Banned, Suspended, Active)
router.patch("/users/:id/status", validate(UpdateUserStatusSchema), adminController.updateUserStatus);

// Khóa tính năng tạm thời
router.post("/users/:id/lock-feature", validate(LockFeatureSchema), adminController.lockUserFeature);

// ── Thống kê ────────────────────────────────────────────────

// Lấy tổng quan hệ thống (Doanh thu, số lượng job...)
router.get("/stats", adminController.getStats);

export default router;
