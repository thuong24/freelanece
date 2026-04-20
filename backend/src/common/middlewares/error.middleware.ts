import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/app-error";
import { ValidationError } from "../errors/http-errors";
import { errorResponse } from "../response/api-response";
import { logger } from "../utils/logger";
import { env } from "../../config/env";

// Global error handler — middleware cuối cùng trong Express
// Nhận tất cả lỗi từ next(err) hoặc async handler
export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── Lỗi Validation (Zod) ────────────────────────────────
  if (err instanceof ValidationError) {
    errorResponse(res, err.message, 422, err.code, err.details);
    return;
  }

  // ── Lỗi nghiệp vụ (AppError) ────────────────────────────
  if (err instanceof AppError) {
    if (!err.isOperational) {
      // Lỗi không mong đợi — log đầy đủ
      logger.error("Lỗi hệ thống không xác định:", err);
    }
    errorResponse(res, err.message, err.statusCode, err.code);
    return;
  }

  // ── Lỗi Prisma ──────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (err.code === "P2002") {
      errorResponse(res, "Dữ liệu đã tồn tại trong hệ thống", 409, "CONFLICT");
      return;
    }
    // P2025: Record not found
    if (err.code === "P2025") {
      errorResponse(res, "Không tìm thấy dữ liệu yêu cầu", 404, "NOT_FOUND");
      return;
    }
    logger.error("Lỗi Prisma:", err);
    errorResponse(res, "Lỗi cơ sở dữ liệu, vui lòng thử lại", 500, "DATABASE_ERROR");
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    logger.error("Prisma validation error:", err);
    errorResponse(res, "Dữ liệu không hợp lệ", 400, "VALIDATION_ERROR");
    return;
  }

  // ── Lỗi không xác định ──────────────────────────────────
  logger.error("Unhandled error:", err);

  // Không để lỗi kỹ thuật thô lộ ra ngoài production
  const message =
    env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Hệ thống đang gặp sự cố, vui lòng thử lại sau";

  errorResponse(res, message, 500, "INTERNAL_SERVER_ERROR");
};

// Async handler wrapper — bắt lỗi từ async controller
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
