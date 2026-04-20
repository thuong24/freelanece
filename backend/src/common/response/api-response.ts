import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Response thành công — có hoặc không có meta phân trang
export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  meta?: PaginationMeta
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    ...(meta && { meta }),
  });
};

// Response lỗi — có code nội bộ và chi tiết tùy chọn
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = "INTERNAL_SERVER_ERROR",
  details?: unknown
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      ...(details && { details }),
    },
  });
};
