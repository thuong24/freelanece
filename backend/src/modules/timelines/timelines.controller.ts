import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as timelinesService from "./timelines.service";
import type { CreateTimelineDto } from "./timelines.dto";

// GET /api/contracts/:id/timelines
export const getTimelines = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  };
  const { timelines, meta } = await timelinesService.getTimelines(req.params.id, req.user!.id, query);
  return successResponse(res, "Lấy danh sách lịch sử thành công", timelines, 200, meta);
});

// POST /api/contracts/:id/timelines
export const createTimeline = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as CreateTimelineDto;
  const timeline = await timelinesService.createTimeline(req.params.id, req.user!.id, dto);
  return successResponse(res, "Cập nhật tiến độ thành công", timeline, 201);
});
