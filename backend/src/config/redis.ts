import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../common/utils/logger";

// Singleton Redis client
let redisClient: Redis | null = null;

export const getRedis = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    redisClient.on("connect", () => {
      logger.info("✅ Redis đã kết nối thành công");
    });

    redisClient.on("error", (err) => {
      logger.error("❌ Redis lỗi kết nối:", err);
    });

    redisClient.on("close", () => {
      logger.warn("⚠️ Redis đã ngắt kết nối");
    });
  }

  return redisClient;
};

// Đóng kết nối khi shutdown
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
