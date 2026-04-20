import { z } from "zod";

// Schema tạo bid
export const CreateBidSchema = z.object({
  bidAmount: z
    .number()
    .positive("Giá thầu phải lớn hơn 0")
    .min(10000, "Giá thầu tối thiểu là 10,000 VNĐ"),
  estimatedDays: z
    .number()
    .int("Số ngày phải là số nguyên")
    .min(1, "Tối thiểu 1 ngày")
    .max(365, "Tối đa 365 ngày"),
  message: z
    .string()
    .min(20, "Lời nhắn phải có ít nhất 20 ký tự")
    .max(2000, "Lời nhắn không được vượt quá 2,000 ký tự")
    .trim(),
  screeningAnswer: z
    .string()
    .max(1000, "Câu trả lời không được vượt quá 1,000 ký tự")
    .trim()
    .optional(),
});

// Schema cập nhật bid
export const UpdateBidSchema = z.object({
  bidAmount: z.number().positive().min(10000).optional(),
  estimatedDays: z.number().int().min(1).max(365).optional(),
  message: z.string().min(20).max(2000).trim().optional(),
  screeningAnswer: z.string().max(1000).trim().optional(),
});

// Schema query danh sách bid
export const GetBidsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(20),
  sortBy: z.enum(["createdAt", "bidAmount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]).optional(),
});

export type CreateBidDto = z.infer<typeof CreateBidSchema>;
export type UpdateBidDto = z.infer<typeof UpdateBidSchema>;
export type GetBidsQueryDto = z.infer<typeof GetBidsQuerySchema>;
