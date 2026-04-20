import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as bidsService from "./bids.service";
import type { CreateBidDto, UpdateBidDto, GetBidsQueryDto } from "./bids.dto";

// POST /api/jobs/:jobId/bids
export const createBid = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as CreateBidDto;
  const bid = await bidsService.createBid(req.params.jobId, req.user!.id, dto);
  return successResponse(res, "Đặt giá thầu thành công", bid, 201);
});

// GET /api/jobs/:jobId/bids
export const getJobBids = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetBidsQueryDto;
  const { bids, meta } = await bidsService.getJobBids(req.params.jobId, req.user!.id, query);
  return successResponse(res, "Lấy danh sách giá thầu thành công", bids, 200, meta);
});

// GET /api/bids/my
export const getMyBids = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  };
  const { bids, meta } = await bidsService.getMyBids(req.user!.id, query);
  return successResponse(res, "Lấy danh sách giá thầu của bạn thành công", bids, 200, meta);
});

// GET /api/bids/:id
export const getBidById = asyncHandler(async (req: Request, res: Response) => {
  const bid = await bidsService.getBidById(req.params.id, req.user!.id);
  return successResponse(res, "Lấy chi tiết giá thầu thành công", bid);
});

// PATCH /api/bids/:id
export const updateBid = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as UpdateBidDto;
  const bid = await bidsService.updateBid(req.params.id, req.user!.id, dto);
  return successResponse(res, "Cập nhật giá thầu thành công", bid);
});

// DELETE /api/bids/:id
export const withdrawBid = asyncHandler(async (req: Request, res: Response) => {
  const bid = await bidsService.withdrawBid(req.params.id, req.user!.id);
  return successResponse(res, "Rút giá thầu thành công", bid);
});
