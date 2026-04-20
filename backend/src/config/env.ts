import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Schema validate toàn bộ biến môi trường khi server khởi động
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL là bắt buộc"),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET là bắt buộc"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET là bắt buộc"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Phí nền tảng
  PLATFORM_FEE_RATE: z.coerce.number().min(0).max(1).default(0.05),
  BUMP_FEE: z.coerce.number().positive().default(10000),

  // Quy tắc escrow
  ESCROW_HOLD_DAYS: z.coerce.number().positive().default(3),
  AUTO_RELEASE_HOURS: z.coerce.number().positive().default(72),
  MIA_THRESHOLD_HOURS: z.coerce.number().positive().default(48),
  MAX_PENALTY_PERCENT: z.coerce.number().min(0).max(1).default(0.25),
  PENALTY_PERCENT_PER_DAY: z.coerce.number().min(0).max(1).default(0.05),

  // Quota
  FREE_POST_QUOTA: z.coerce.number().positive().default(1),
  FREE_BID_QUOTA: z.coerce.number().positive().default(10),

  // Feature lock
  BYPASS_LOCK_HOURS: z.coerce.number().positive().default(24),
  BYPASS_VIOLATION_THRESHOLD: z.coerce.number().positive().default(3),

  // Rate limit
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(200),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().positive().default(10),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_DIR: z.string().default("logs"),

  // Payment gateway (optional — cấu hình sau)
  VNPAY_TMN_CODE: z.string().optional(),
  VNPAY_HASH_SECRET: z.string().optional(),
  VNPAY_URL: z.string().optional(),
  MOMO_PARTNER_CODE: z.string().optional(),
  MOMO_ACCESS_KEY: z.string().optional(),
  MOMO_SECRET_KEY: z.string().optional(),
});

// Parse và validate — nếu thiếu biến bắt buộc sẽ throw lỗi ngay khi boot
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Cấu hình môi trường không hợp lệ:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
