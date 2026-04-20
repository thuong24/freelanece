import { AppError } from "./app-error";
import { ERROR_CODES } from "../constants/error-codes";

// 400 — Dữ liệu đầu vào không hợp lệ
export class BadRequestError extends AppError {
  constructor(message: string = "Yêu cầu không hợp lệ") {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR);
  }
}

// 401 — Chưa đăng nhập hoặc token hết hạn
export class UnauthorizedError extends AppError {
  constructor(message: string = "Bạn cần đăng nhập để thực hiện thao tác này") {
    super(message, 401, ERROR_CODES.UNAUTHORIZED);
  }
}

// 403 — Đã đăng nhập nhưng không có quyền
export class ForbiddenError extends AppError {
  constructor(message: string = "Bạn không có quyền thực hiện thao tác này") {
    super(message, 403, ERROR_CODES.FORBIDDEN);
  }
}

// 404 — Không tìm thấy tài nguyên
export class NotFoundError extends AppError {
  constructor(message: string = "Không tìm thấy dữ liệu yêu cầu") {
    super(message, 404, ERROR_CODES.NOT_FOUND);
  }
}

// 409 — Xung đột dữ liệu (duplicate)
export class ConflictError extends AppError {
  constructor(message: string = "Dữ liệu đã tồn tại trong hệ thống") {
    super(message, 409, "CONFLICT");
  }
}

// 422 — Validation lỗi (Zod)
export class ValidationError extends AppError {
  public readonly details: Record<string, string[]>;

  constructor(
    message: string = "Dữ liệu không hợp lệ",
    details: Record<string, string[]> = {}
  ) {
    super(message, 422, ERROR_CODES.VALIDATION_ERROR);
    this.details = details;
  }
}

// 400 — Vi phạm nghiệp vụ (business rule)
export class BusinessRuleError extends AppError {
  constructor(message: string, code: string = "BUSINESS_RULE_VIOLATION") {
    super(message, 400, code);
  }
}

// 500 — Lỗi hệ thống không xác định
export class InternalServerError extends AppError {
  constructor(message: string = "Hệ thống đang gặp sự cố, vui lòng thử lại sau") {
    super(message, 500, ERROR_CODES.INTERNAL_SERVER_ERROR, false);
  }
}
