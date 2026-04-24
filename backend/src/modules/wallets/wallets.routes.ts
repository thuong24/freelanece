import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  GetTransactionsQuerySchema,
  DepositSchema,
  WithdrawSchema,
  CreateDepositRequestSchema,
  SePayWebhookSchema,
} from "./wallets.dto";
import * as walletsController from "./wallets.controller";

const router = Router();

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// POST /api/wallets/deposit/sepay-webhook — Webhook nhận từ SePay (không cần auth)
router.post(
  "/deposit/sepay-webhook",
  validate(SePayWebhookSchema),
  walletsController.handleSePayWebhook
);


// ==========================================
// PROTECTED ENDPOINTS
// ==========================================

// Tất cả wallet endpoints bên dưới đều yêu cầu đăng nhập
router.use(requireAuth);

// GET /api/wallets/me — xem số dư ví
router.get("/me", walletsController.getMyWallet);

// GET /api/wallets/transactions — lịch sử giao dịch
router.get(
  "/transactions",
  validate(GetTransactionsQuerySchema, "query"),
  walletsController.getTransactions
);

// POST /api/wallets/deposit — nạp tiền (webhook cũ, có thể bỏ hoặc giữ)
router.post("/deposit", validate(DepositSchema), walletsController.deposit);

// POST /api/wallets/withdraw — rút tiền
router.post("/withdraw", validate(WithdrawSchema), walletsController.withdraw);

// POST /api/wallets/deposit/request — Tạo yêu cầu nạp tiền
router.post(
  "/deposit/request",
  validate(CreateDepositRequestSchema),
  walletsController.createDepositRequest
);

// GET /api/wallets/deposit/requests — Lấy danh sách yêu cầu nạp tiền PENDING
router.get("/deposit/requests", walletsController.getDepositRequests);

export default router;
