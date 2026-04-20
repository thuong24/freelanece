import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { logger } from "./common/utils/logger";
import { defaultRateLimit } from "./common/middlewares/rate-limit.middleware";
import { errorMiddleware } from "./common/middlewares/error.middleware";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import walletRoutes from "./modules/wallets/wallets.routes";
import jobRoutes from "./modules/jobs/jobs.routes";
import bidRoutes from "./modules/bids/bids.routes";
import contractRoutes from "./modules/contracts/contracts.routes";
import disputeRoutes from "./modules/disputes/disputes.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import reviewRoutes from "./modules/reviews/reviews.routes";
import adminRoutes from "./modules/admin/admin.routes";
import chatRoutes from "./modules/chats/chats.routes";
import milestoneRoutes from "./modules/milestones/milestones.routes";
import discoveryRoutes from "./modules/discovery/discovery.routes";

export const createApp = (): Application => {
  const app = express();

  // ── Security middlewares ────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(","),
      credentials: true, // cho phép gửi cookie
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ── Parsing middlewares ─────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ── Logging ─────────────────────────────────────────────
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.http(msg.trim()) },
      skip: () => env.NODE_ENV === "test",
    })
  );

  // ── Rate limiting toàn cục ───────────────────────────────
  app.use("/api", defaultRateLimit);

  // ── Health check ─────────────────────────────────────────
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    });
  });

  // ── API Routes ───────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/wallets", walletRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/bids", bidRoutes);
  app.use("/api/contracts", contractRoutes);
  app.use("/api/disputes", disputeRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/chats", chatRoutes);
  app.use("/api/milestones", milestoneRoutes);
  app.use("/api/discovery", discoveryRoutes);

  // ── 404 handler ──────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Không tìm thấy đường dẫn này",
      error: { code: "NOT_FOUND" },
    });
  });

  // ── Global error handler (phải đặt cuối cùng) ───────────
  app.use(errorMiddleware);

  return app;
};
