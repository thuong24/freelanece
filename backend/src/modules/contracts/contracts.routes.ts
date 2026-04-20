import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  AcceptBidSchema,
  SubmitDemoSchema,
  SubmitFinalSchema,
  RejectOrRevisionSchema,
} from "./contracts.dto";
import * as contractsController from "./contracts.controller";

const router = Router();

// Tất cả contract endpoints đều yêu cầu đăng nhập
router.use(requireAuth);

// GET /api/contracts — danh sách hợp đồng (của client / freelancer)
router.get("/", contractsController.getContracts);

// GET /api/contracts/:id — chi tiết hợp đồng
router.get("/:id", contractsController.getContractById);

// POST /api/contracts/accept-bid — chốt deal & giam tiền
router.post("/accept-bid", validate(AcceptBidSchema), contractsController.acceptBid);

// ── Router con (Timelines, Chat, v.v.) ─────────────────────
import timelinesRoutes from "../timelines/timelines.routes";
router.use("/:id/timelines", timelinesRoutes);

// ── Delivery Flow ───────────────────────────────────────────

// POST /api/contracts/:id/submit-demo — freelancer nộp demo
router.post("/:id/submit-demo", validate(SubmitDemoSchema), contractsController.submitDemo);

// POST /api/contracts/:id/approve-demo — client duyệt demo
router.post("/:id/approve-demo", contractsController.approveDemo);

// POST /api/contracts/:id/reject-demo — client từ chối demo
router.post("/:id/reject-demo", validate(RejectOrRevisionSchema), contractsController.rejectDemo);

// POST /api/contracts/:id/submit-final — freelancer nộp source code
router.post("/:id/submit-final", validate(SubmitFinalSchema), contractsController.submitFinal);

// POST /api/contracts/:id/revision — client yêu cầu sửa code
router.post("/:id/revision", validate(RejectOrRevisionSchema), contractsController.requestRevision);

// POST /api/contracts/:id/accept — client nghiệm thu (giải ngân)
router.post("/:id/accept", contractsController.acceptContract);

// ── Extension & Cancel ──────────────────────────────────────

import { ExtensionRequestSchema, MutualCancelSchema } from "./contracts.dto";

// POST /api/contracts/:id/extension-request
router.post("/:id/extension-request", validate(ExtensionRequestSchema), contractsController.requestExtension);

// POST /api/contracts/:id/extension-request/approve
router.post("/:id/extension-request/approve", contractsController.approveExtension);

// POST /api/contracts/:id/extension-request/reject
router.post("/:id/extension-request/reject", contractsController.rejectExtension);

// POST /api/contracts/:id/mutual-cancel/request
router.post("/:id/mutual-cancel/request", validate(MutualCancelSchema), contractsController.requestMutualCancel);

// POST /api/contracts/:id/mutual-cancel/approve
router.post("/:id/mutual-cancel/approve", contractsController.approveMutualCancel);

// POST /api/contracts/:id/mutual-cancel/reject
router.post("/:id/mutual-cancel/reject", contractsController.rejectMutualCancel);

// ── MIA & Force Cancel ──────────────────────────────────────

// POST /api/contracts/:id/ping
router.post("/:id/ping", contractsController.pingFreelancer);

// POST /api/contracts/:id/force-cancel
router.post("/:id/force-cancel", contractsController.forceCancel);

export default router;
