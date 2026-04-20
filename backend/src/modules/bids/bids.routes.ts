import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { UpdateBidSchema } from "./bids.dto";
import * as bidsController from "./bids.controller";

const router = Router();

// Tất cả bid endpoints đều yêu cầu đăng nhập
router.use(requireAuth);

// GET /api/bids/my — danh sách bid của mình
router.get("/my", bidsController.getMyBids);

// GET /api/bids/:id — chi tiết bid
router.get("/:id", bidsController.getBidById);

// PATCH /api/bids/:id — cập nhật bid
router.patch("/:id", validate(UpdateBidSchema), bidsController.updateBid);

// DELETE /api/bids/:id — rút bid
router.delete("/:id", bidsController.withdrawBid);

export default router;
