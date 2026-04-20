import { z } from "zod";

export const CreateDisputeSchema = z.object({
  contractId: z.string().uuid("ID hợp đồng không hợp lệ"),
  reason: z.string().min(20, "Lý do khiếu nại phải có ít nhất 20 ký tự").max(2000),
  evidenceUrl: z.string().url("URL bằng chứng không hợp lệ").max(500).optional(),
});

export const ResolveDisputeSchema = z.object({
  resolutionInfo: z.string().min(10).max(1000),
  refundPercentage: z.number().int().min(0).max(100),
  applyPenalty: z.boolean().default(false),
  penaltyReason: z.string().max(500).optional(),
  lockFeature: z.enum(["POST_JOB", "BID"]).optional().nullable(),
  lockDays: z.number().int().min(1).max(365).optional(),
  banUser: z.boolean().default(false),
  punishedUserId: z.string().uuid().optional(),
});

export type CreateDisputeDto = z.infer<typeof CreateDisputeSchema>;
export type ResolveDisputeDto = z.infer<typeof ResolveDisputeSchema>;
