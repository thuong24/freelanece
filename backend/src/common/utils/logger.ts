import winston from "winston";
import path from "path";
import { env } from "../../config/env";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format log cho console (màu sắc, dễ đọc)
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

// Format log cho file (JSON, dễ parse)
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [
    // Log ra console
    new winston.transports.Console({ format: consoleFormat }),

    // Log error vào file riêng
    new winston.transports.File({
      filename: path.join(env.LOG_DIR, "error.log"),
      level: "error",
      format: fileFormat,
    }),

    // Log tất cả vào combined.log
    new winston.transports.File({
      filename: path.join(env.LOG_DIR, "combined.log"),
      format: fileFormat,
    }),
  ],
});
