import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { logger } from "./common/utils/logger";
import { initCronJobs } from "./cron";

// ── Xử lý lỗi không bắt được — tránh crash server ──────────
process.on("uncaughtException", (err: Error) => {
  logger.error("💥 uncaughtException — đang tắt server:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("💥 unhandledRejection:", reason);
  process.exit(1);
});

// ── Khởi động server ─────────────────────────────────────────
const bootstrap = async (): Promise<void> => {
  // Kiểm tra kết nối database trước khi mở cổng
  try {
    await prisma.$connect();
    logger.info("✅ Kết nối database thành công");
  } catch (err) {
    logger.error("❌ Không thể kết nối database:", err);
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server đang chạy tại http://localhost:${env.PORT}`);
    logger.info(`🌍 Môi trường: ${env.NODE_ENV}`);
  });

  // Khởi tạo Cronjobs
  initCronJobs();

  // ── Graceful shutdown ─────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`\n⚠️  Nhận tín hiệu ${signal} — đang tắt server...`);

    server.close(async () => {
      logger.info("🔌 HTTP server đã đóng");
      await prisma.$disconnect();
      logger.info("🔌 Database đã ngắt kết nối");
      process.exit(0);
    });

    // Force exit nếu quá 10 giây
    setTimeout(() => {
      logger.error("❗ Tắt server quá lâu — force exit");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

bootstrap();
