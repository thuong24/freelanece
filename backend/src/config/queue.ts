import { Queue } from "bullmq";
import { getRedis } from "./redis";

// Định nghĩa tên queue
export const QUEUE_NAMES = {
  NOTIFICATION: "notification",
  ESCROW: "escrow",
  EMAIL: "email",
} as const;

// Queue gửi notification
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// Queue xử lý escrow bất đồng bộ (nếu cần)
export const escrowQueue = new Queue(QUEUE_NAMES.ESCROW, {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

// Queue gửi email
export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "fixed", delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});
