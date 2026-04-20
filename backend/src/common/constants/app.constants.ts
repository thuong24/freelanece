import { env } from "../../config/env";

// Hằng số nghiệp vụ — đọc từ env, có fallback an toàn
export const APP_CONSTANTS = {
  // Phí nền tảng
  PLATFORM_FEE_RATE: env.PLATFORM_FEE_RATE,       // % hoa hồng sàn
  BUMP_FEE: env.BUMP_FEE,                           // coin để đẩy top

  // Escrow
  ESCROW_HOLD_DAYS: env.ESCROW_HOLD_DAYS,           // ngày giữ tiền sau giải ngân
  AUTO_RELEASE_HOURS: env.AUTO_RELEASE_HOURS,       // giờ chờ trước auto-release
  MIA_THRESHOLD_HOURS: env.MIA_THRESHOLD_HOURS,     // giờ không hoạt động → MIA
  MAX_PENALTY_PERCENT: env.MAX_PENALTY_PERCENT,     // % phạt tối đa
  PENALTY_PERCENT_PER_DAY: env.PENALTY_PERCENT_PER_DAY, // % phạt mỗi ngày trễ

  // Quota
  FREE_POST_QUOTA: env.FREE_POST_QUOTA,             // lượt đăng bài miễn phí/tháng
  FREE_BID_QUOTA: env.FREE_BID_QUOTA,               // lượt bid miễn phí/tháng

  // Feature lock (anti-bypass)
  BYPASS_LOCK_HOURS: env.BYPASS_LOCK_HOURS,         // giờ khóa sau vi phạm
  BYPASS_VIOLATION_THRESHOLD: env.BYPASS_VIOLATION_THRESHOLD, // số lần vi phạm

  // Cookie
  REFRESH_TOKEN_COOKIE_NAME: "refresh_token",
  COOKIE_MAX_AGE_MS: 30 * 24 * 60 * 60 * 1000,    // 30 ngày

  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
