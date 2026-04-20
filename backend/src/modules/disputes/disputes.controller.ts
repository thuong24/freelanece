import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as disputesService from "./disputes.service";
import type { CreateDisputeDto, ResolveDisputeDto } from "./disputes.dto";

// POST /api/disputes
export const createDispute = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as CreateDisputeDto;
  const dispute = await disputesService.createDispute(req.user!.id, dto);
  return successResponse(res, "Đã gửi khiếu nại thành công", dispute, 201);
});

// GET /api/disputes (Admin only or user seeing their own via filter)
export const getDisputes = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;
  const { disputes, meta } = await disputesService.getDisputes(query);
  return successResponse(res, "Lấy danh sách khiếu nại thành công", disputes, 200, meta);
});

// GET /api/disputes/:id
export const getDisputeById = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputesService.getDisputeById(req.params.id);
  return successResponse(res, "Lấy chi tiết khiếu nại thành công", dispute);
});

// POST /api/disputes/:id/resolve (Admin only)
export const resolveDispute = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as ResolveDisputeDto;
  const result = await disputesService.resolveDispute(req.params.id, req.user!.id, dto);
  return successResponse(res, "Phân xử khiếu nại thành công", result);
});
