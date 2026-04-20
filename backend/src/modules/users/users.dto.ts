import { z } from "zod";

// Schema cập nhật profile
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được vượt quá 100 ký tự")
    .trim()
    .optional(),
  bio: z
    .string()
    .max(500, "Bio không được vượt quá 500 ký tự")
    .trim()
    .optional(),
  skills: z
    .array(z.string().trim().max(50))
    .max(20, "Không được nhập quá 20 kỹ năng")
    .optional(),
  avatarUrl: z
    .string()
    .url("URL ảnh đại diện không hợp lệ")
    .max(500)
    .optional()
    .nullable(),
});

// Schema query danh sách đánh giá
export const GetReviewsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(10),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export type GetReviewsQueryDto = z.infer<typeof GetReviewsQuerySchema>;
