import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { CreateReviewSchema } from "./reviews.dto";
import * as reviewsController from "./reviews.controller";

const router = Router();

router.use(requireAuth);

// POST /api/reviews — Đánh giá hợp đồng sau khi hoàn thành
router.post("/", validate(CreateReviewSchema), reviewsController.createReview);

export default router;
