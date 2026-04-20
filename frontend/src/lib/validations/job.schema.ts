import { z } from "zod";

export const CreateJobSchema = z.object({
  title: z.string().min(10, "Tiêu đề phải có ít nhất 10 ký tự").max(255),
  description: z.string().min(50, "Mô tả phải có ít nhất 50 ký tự").max(5000),
  budget: z.number().min(100000, "Ngân sách tối thiểu 100,000 VNĐ"),
  deadlineDays: z.number().int().min(1).max(365),
  codeQualityRequirement: z.enum(["FUNCTIONAL_ONLY", "CLEAN_CODE", "CLEAN_CODE_WITH_COMMENTS"]).optional(),
  screeningQuestion: z.string().max(500).optional(),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
