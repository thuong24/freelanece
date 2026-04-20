import { z } from "zod";

export const SendMessageSchema = z.object({
  contractId: z.string().uuid("ID hợp đồng không hợp lệ"),
  content: z.string().min(1, "Nội dung tin nhắn không được để trống").max(2000),
});

export const GetMessagesQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(50),
});

export type SendMessageDto = z.infer<typeof SendMessageSchema>;
export type GetMessagesQueryDto = z.infer<typeof GetMessagesQuerySchema>;
