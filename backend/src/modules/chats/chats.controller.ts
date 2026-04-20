import { Request, Response } from "express";
import { asyncHandler } from "../../common/middlewares/error.middleware";
import { successResponse } from "../../common/response/api-response";
import * as chatsService from "./chats.service";
import type { SendMessageDto, GetMessagesQueryDto } from "./chats.dto";

// POST /api/chats
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const dto = req.body as SendMessageDto;
  const message = await chatsService.sendMessage(req.user!.id, dto);
  return successResponse(res, "Gửi tin nhắn thành công", message, 201);
});

// GET /api/chats/contracts/:id
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as GetMessagesQueryDto;
  const { messages, meta } = await chatsService.getMessages(req.params.id, req.user!.id, query);
  return successResponse(res, "Lấy danh sách tin nhắn thành công", messages, 200, meta);
});
