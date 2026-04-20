import { z } from "zod";

export const CreateMilestoneSchema = z.object({
  title: z.string().min(5).max(255),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  orderIndex: z.number().int().min(1),
});

export const SubmitMilestoneSchema = z.object({
  demoUrl: z.string().url().max(500).optional(),
  note: z.string().max(1000).optional(),
});

export type CreateMilestoneDto = z.infer<typeof CreateMilestoneSchema>;
export type SubmitMilestoneDto = z.infer<typeof SubmitMilestoneSchema>;
