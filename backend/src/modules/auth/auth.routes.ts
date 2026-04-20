import { Router } from "express";
import { authRateLimit } from "../../common/middlewares/rate-limit.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { RegisterSchema, LoginSchema, GoogleOneTapSchema } from "./auth.dto";
import * as authController from "./auth.controller";

const router = Router();

// Áp dụng rate limit nghiêm ngặt cho tất cả auth endpoints
router.use(authRateLimit);

// POST /api/auth/register
router.post("/register", validate(RegisterSchema), authController.register);

// POST /api/auth/login
router.post("/login", validate(LoginSchema), authController.login);

// POST /api/auth/refresh-token
router.post("/refresh-token", authController.refreshToken);

// POST /api/auth/logout
router.post("/logout", authController.logout);

// POST /api/auth/google-one-tap
router.post("/google-one-tap", validate(GoogleOneTapSchema), authController.googleOneTap);

export default router;
