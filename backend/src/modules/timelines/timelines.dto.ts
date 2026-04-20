import { z } from "zod";

export const CreateTimelineSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(5).max(1000),
});

export type CreateTimelineDto = z.infer<typeof CreateTimelineSchema>;
