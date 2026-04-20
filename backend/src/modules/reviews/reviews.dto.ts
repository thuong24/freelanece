import { z } from "zod";

export const CreateReviewSchema = z.object({
  contractId: z.string().uuid("ID hợp đồng không hợp lệ"),
  codeQualityScore: z.number().int().min(1).max(5).default(5),
  communicationScore: z.number().int().min(1).max(5).default(5),
  speedScore: z.number().int().min(1).max(5).default(5),
  comment: z.string().max(1000, "Nhận xét không được vượt quá 1000 ký tự").optional(),
});

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
