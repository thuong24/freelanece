import { z } from "zod";

export const ReviewSchema = z.object({
  codeQualityScore: z.number().int().min(1).max(5),
  communicationScore: z.number().int().min(1).max(5),
  speedScore: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;
