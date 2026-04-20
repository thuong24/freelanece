import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import {
  GetTransactionsQuerySchema,
  DepositSchema,
  WithdrawSchema,
} from "./wallets.dto";
import * as walletsController from "./wallets.controller";

const router = Router();

// Tất cả wallet endpoints đều yêu cầu đăng nhập
router.use(requireAuth);

// GET /api/wallets/me — xem số dư ví
router.get("/me", walletsController.getMyWallet);

// GET /api/wallets/transactions — lịch sử giao dịch
router.get(
  "/transactions",
  validate(GetTransactionsQuerySchema, "query"),
  walletsController.getTransactions
);

// POST /api/wallets/deposit — nạp tiền (webhook)
router.post("/deposit", validate(DepositSchema), walletsController.deposit);

// POST /api/wallets/withdraw — rút tiền
router.post("/withdraw", validate(WithdrawSchema), walletsController.withdraw);

export default router;
