import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { UpdateProfileSchema, GetReviewsQuerySchema } from "./users.dto";
import * as usersController from "./users.controller";

const router = Router();

// GET /api/users/me — lấy profile cá nhân
router.get("/me", requireAuth, usersController.getMe);

// PATCH /api/users/me — cập nhật profile
router.patch("/me", requireAuth, validate(UpdateProfileSchema), usersController.updateMe);

// GET /api/users/:id — xem public profile
router.get("/:id", usersController.getUserById);

// GET /api/users/:id/reviews — xem đánh giá của user
router.get("/:id/reviews", validate(GetReviewsQuerySchema, "query"), usersController.getUserReviews);

export default router;
