import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  CreateJobSchema,
  UpdateJobSchema,
  GetJobsQuerySchema,
} from "./jobs.dto";
import { CreateBidSchema, GetBidsQuerySchema } from "../bids/bids.dto";
import * as jobsController from "./jobs.controller";
import * as bidsController from "../../modules/bids/bids.controller";

const router = Router();

// ── Job endpoints ───────────────────────────────────────────

// GET /api/jobs — danh sách job (public, không cần auth)
router.get("/", validate(GetJobsQuerySchema, "query"), jobsController.getJobs);

// GET /api/jobs/my — job của tôi (cần auth)
router.get("/my", requireAuth, jobsController.getMyJobs);

// GET /api/jobs/:id — chi tiết job
router.get("/:id", jobsController.getJobById);

// POST /api/jobs — tạo job mới
router.post("/", requireAuth, validate(CreateJobSchema), jobsController.createJob);

// PATCH /api/jobs/:id — cập nhật job
router.patch("/:id", requireAuth, validate(UpdateJobSchema), jobsController.updateJob);

// DELETE /api/jobs/:id — xóa job
router.delete("/:id", requireAuth, jobsController.deleteJob);

// POST /api/jobs/:id/bump — đẩy top
router.post("/:id/bump", requireAuth, jobsController.bumpJob);

// ── Bid sub-routes (nested under job) ──────────────────────

// POST /api/jobs/:jobId/bids — đặt giá thầu
router.post("/:jobId/bids", requireAuth, validate(CreateBidSchema), bidsController.createBid);

// GET /api/jobs/:jobId/bids — xem danh sách giá thầu
router.get(
  "/:jobId/bids",
  requireAuth,
  validate(GetBidsQuerySchema, "query"),
  bidsController.getJobBids
);

export default router;
