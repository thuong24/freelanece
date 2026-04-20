import { Router } from "express";
import { requireAuth } from "../../common/middlewares/auth.middleware";
import { validate } from "../../common/middlewares/validate.middleware";
import { SendMessageSchema, GetMessagesQuerySchema } from "./chats.dto";
import * as chatsController from "./chats.controller";

const router = Router();

router.use(requireAuth);

// POST /api/chats — Gửi tin nhắn
router.post("/", validate(SendMessageSchema), chatsController.sendMessage);

// GET /api/chats/contracts/:id — Lấy tin nhắn theo hợp đồng
router.get("/contracts/:id", validate(GetMessagesQuerySchema, "query"), chatsController.getMessages);

export default router;
