import { z } from "zod";

export const GetUsersQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export const UpdateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]),
  reason: z.string().max(500).optional(),
});

export const LockFeatureSchema = z.object({
  feature: z.enum(["POST_JOB", "BID"]),
  days: z.number().int().min(1).max(365),
  reason: z.string().min(10).max(500),
});

export type GetUsersQueryDto = z.infer<typeof GetUsersQuerySchema>;
export type UpdateUserStatusDto = z.infer<typeof UpdateUserStatusSchema>;
export type LockFeatureDto = z.infer<typeof LockFeatureSchema>;
