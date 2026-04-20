import { z } from "zod";

// Schema chốt deal (client accept bid)
export const AcceptBidSchema = z.object({
  bidId: z.string().uuid("ID giá thầu không hợp lệ"),
});

// Schema nộp demo
export const SubmitDemoSchema = z.object({
  demoUrl: z.string().url("URL demo không hợp lệ").max(500),
  message: z.string().max(1000).optional(),
});

// Schema nộp source code (final)
export const SubmitFinalSchema = z.object({
  sourceCodeUrl: z.string().url("URL source code không hợp lệ").max(500),
  readmeConfirmed: z.boolean().refine((val) => val === true, {
    message: "Bạn phải xác nhận đã đính kèm README hướng dẫn sử dụng",
  }),
  message: z.string().max(1000).optional(),
});

// Schema từ chối demo hoặc yêu cầu sửa (revision)
export const RejectOrRevisionSchema = z.object({
  reason: z.string().min(10, "Lý do phải có ít nhất 10 ký tự").max(1000),
});

// Schema xin gia hạn
export const ExtensionRequestSchema = z.object({
  requestedDays: z.number().int().min(1).max(30),
  reason: z.string().min(10).max(1000),
});

// Schema xin hủy hợp đồng êm thấm (mutual cancel)
export const MutualCancelSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export type AcceptBidDto = z.infer<typeof AcceptBidSchema>;
export type SubmitDemoDto = z.infer<typeof SubmitDemoSchema>;
export type SubmitFinalDto = z.infer<typeof SubmitFinalSchema>;
export type RejectOrRevisionDto = z.infer<typeof RejectOrRevisionSchema>;
export type ExtensionRequestDto = z.infer<typeof ExtensionRequestSchema>;
export type MutualCancelDto = z.infer<typeof MutualCancelSchema>;
