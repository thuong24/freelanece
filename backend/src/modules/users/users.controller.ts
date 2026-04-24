import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as usersService from "./users.service";
import type { UpdateProfileDto, GetReviewsQueryDto } from "./users.dto";

// GET /api/users/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getMe(req.user!.id);
  return successResponse(res, "Lấy thông tin thành công", user);
});

// PATCH /api/users/me
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as UpdateProfileDto;
  
  if (req.file) {
    // Generate the URL for the frontend to access
    dto.avatarUrl = `/uploads/avatars/${req.file.filename}`;
  }

  const user = await usersService.updateMe(req.user!.id, dto);
  return successResponse(res, "Cập nhật thông tin thành công", user);
});

// GET /api/users/:id
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getPublicProfile(req.params.id);
  return successResponse(res, "Lấy thông tin người dùng thành công", user);
});

// GET /api/users/:id/reviews
export const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetReviewsQueryDto;
  const { reviews, meta } = await usersService.getUserReviews(req.params.id, query);
  return successResponse(res, "Lấy danh sách đánh giá thành công", reviews, 200, meta);
});
