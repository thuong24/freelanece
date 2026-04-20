import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { requireAdmin } from "../../common/middlewares/admin.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { CreateDisputeSchema, ResolveDisputeSchema } from "./disputes.dto";
import * as disputesController from "./disputes.controller";

const router = Router();

// Tất cả dispute endpoints đều yêu cầu đăng nhập
router.use(requireAuth);

// GET /api/disputes — danh sách khiếu nại (admin xem tất cả, user xem của mình)
router.get("/", disputesController.getDisputes);

// GET /api/disputes/:id — chi tiết khiếu nại
router.get("/:id", disputesController.getDisputeById);

// POST /api/disputes — freelancer/client mở khiếu nại
router.post("/", validate(CreateDisputeSchema), disputesController.createDispute);

// POST /api/disputes/:id/resolve — admin phân xử
router.post("/:id/resolve", requireAdmin, validate(ResolveDisputeSchema), disputesController.resolveDispute);

export default router;
