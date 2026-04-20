import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as milestonesService from "./milestones.service";
import type { CreateMilestoneDto, SubmitMilestoneDto } from "./milestones.dto";

export const createMilestones = asyncHandler(async (req: Request, res: Response) => {
  const dtos = req.body.milestones as CreateMilestoneDto[];
  const contractId = req.body.contractId as string;
  const milestones = await milestonesService.createMilestones(contractId, req.user!.id, dtos);
  return successResponse(res, "Khởi tạo milestone thành công", milestones, 201);
});

export const submitMilestone = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as SubmitMilestoneDto;
  const milestone = await milestonesService.submitMilestone(req.params.id, req.user!.id, dto);
  return successResponse(res, "Đã nộp kết quả milestone", milestone);
});

export const approveMilestone = asyncHandler(async (req: Request, res: Response) => {
  const milestone = await milestonesService.approveMilestone(req.params.id, req.user!.id);
  return successResponse(res, "Đã duyệt và giải ngân milestone", milestone);
});
