import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as adminService from "./admin.service";
import type { GetUsersQueryDto, UpdateUserStatusDto, LockFeatureDto } from "./admin.dto";

// GET /api/admin/users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetUsersQueryDto;
  const { users, meta } = await adminService.getUsers(query);
  return successResponse(res, "Lấy danh sách người dùng thành công", users, 200, meta);
});

// PATCH /api/admin/users/:id/status
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as UpdateUserStatusDto;
  const user = await adminService.updateUserStatus(req.params.id, dto);
  return successResponse(res, "Cập nhật trạng thái thành công", user);
});

// POST /api/admin/users/:id/lock-feature
export const lockUserFeature = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as LockFeatureDto;
  const lock = await adminService.lockUserFeature(req.params.id, dto);
  return successResponse(res, "Khóa tính năng thành công", lock, 201);
});

// GET /api/admin/stats
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await adminService.getSystemStats();
  return successResponse(res, "Lấy thống kê hệ thống thành công", stats);
});
