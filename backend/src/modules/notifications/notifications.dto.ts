import { z } from "zod";

export const GetNotificationsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(20),
  isRead: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export type GetNotificationsQueryDto = z.infer<typeof GetNotificationsQuerySchema>;
