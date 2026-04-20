import rateLimit from "express-rate-limit";
import { env } from "../../config/env";
import { errorResponse } from "../response/api-response";

// Rate limit mặc định — áp dụng cho toàn bộ API
export const defaultRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    errorResponse(
      res,
      "Bạn đang gửi quá nhiều yêu cầu, vui lòng thử lại sau",
      429,
      "RATE_LIMIT_EXCEEDED"
    );
  },
});

// Rate limit nghiêm ngặt hơn cho auth endpoints (chống brute force)
export const authRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    errorResponse(
      res,
      "Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút",
      429,
      "AUTH_RATE_LIMIT_EXCEEDED"
    );
  },
});
