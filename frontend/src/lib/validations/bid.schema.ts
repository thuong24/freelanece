import { z } from "zod";

export const CreateBidSchema = z.object({
  bidAmount: z.number().min(10000, "Giá thầu tối thiểu 10,000 VNĐ"),
  estimatedDays: z.number().int().min(1).max(365),
  message: z.string().min(30, "Lời giới thiệu tối thiểu 30 ký tự").max(2000),
  screeningAnswer: z.string().max(1000).optional(),
});

export type CreateBidInput = z.infer<typeof CreateBidSchema>;
