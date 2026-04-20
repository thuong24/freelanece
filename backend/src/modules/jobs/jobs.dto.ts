import { z } from "zod";

// Schema tạo job mới
export const CreateJobSchema = z.object({
  title: z
    .string()
    .min(10, "Tiêu đề phải có ít nhất 10 ký tự")
    .max(255, "Tiêu đề không được vượt quá 255 ký tự")
    .trim(),
  description: z
    .string()
    .min(30, "Mô tả phải có ít nhất 30 ký tự")
    .max(10000, "Mô tả không được vượt quá 10,000 ký tự")
    .trim(),
  budget: z
    .number()
    .positive("Ngân sách phải lớn hơn 0")
    .min(50000, "Ngân sách tối thiểu là 50,000 VNĐ")
    .max(500000000, "Ngân sách tối đa là 500,000,000 VNĐ"),
  deadlineDays: z
    .number()
    .int("Số ngày hoàn thành phải là số nguyên")
    .min(1, "Thời gian tối thiểu là 1 ngày")
    .max(180, "Thời gian tối đa là 180 ngày"),
  codeQualityRequirement: z.enum(
    ["FUNCTIONAL_ONLY", "CLEAN_CODE", "CLEAN_CODE_WITH_COMMENTS"],
    { errorMap: () => ({ message: "Yêu cầu chất lượng code không hợp lệ" }) }
  ),
  screeningQuestion: z
    .string()
    .max(500, "Câu hỏi sàng lọc không được vượt quá 500 ký tự")
    .trim()
    .optional(),
  isBumped: z.boolean().default(false),
});

// Schema cập nhật job
export const UpdateJobSchema = z.object({
  title: z.string().min(10).max(255).trim().optional(),
  description: z.string().min(30).max(10000).trim().optional(),
  budget: z.number().positive().min(50000).optional(),
  deadlineDays: z.number().int().min(1).max(180).optional(),
  codeQualityRequirement: z
    .enum(["FUNCTIONAL_ONLY", "CLEAN_CODE", "CLEAN_CODE_WITH_COMMENTS"])
    .optional(),
  screeningQuestion: z.string().max(500).trim().optional().nullable(),
});

// Schema query danh sách job
export const GetJobsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(20),
  sortBy: z.enum(["createdAt", "budget", "bumpedAt", "bumped"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().optional(),
  status: z.enum(["OPEN", "ASSIGNED", "CLOSED"]).optional(),
  minBudget: z.coerce.number().positive().optional(),
  maxBudget: z.coerce.number().positive().optional(),
  codeQualityRequirement: z
    .enum(["FUNCTIONAL_ONLY", "CLEAN_CODE", "CLEAN_CODE_WITH_COMMENTS"])
    .optional(),
});

export type CreateJobDto = z.infer<typeof CreateJobSchema>;
export type UpdateJobDto = z.infer<typeof UpdateJobSchema>;
export type GetJobsQueryDto = z.infer<typeof GetJobsQuerySchema>;
