import { ErrorCode } from "../constants/error-codes";

// Base error class — tất cả lỗi tùy chỉnh kế thừa từ đây
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;
  public readonly isOperational: boolean; // true = lỗi nghiệp vụ, false = bug

  constructor(
    message: string,            // Message tiếng Việt cho user
    statusCode: number = 500,
    code: ErrorCode | string = "INTERNAL_SERVER_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Đảm bảo instanceof hoạt động đúng với TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
