import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as reviewsService from "./reviews.service";
import type { CreateReviewDto } from "./reviews.dto";

// POST /api/reviews
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as CreateReviewDto;
  const review = await reviewsService.createReview(req.user!.id, dto);
  return successResponse(res, "Đánh giá thành công", review, 201);
});
