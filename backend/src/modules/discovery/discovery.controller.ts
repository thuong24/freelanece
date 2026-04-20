import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as discoveryService from "./discovery.service";

export const getHomeData = asyncHandler(async (req: Request, res: Response) => {
  const data = await discoveryService.getHomeData();
  return successResponse(res, "Lấy dữ liệu trang chủ thành công", data);
});
