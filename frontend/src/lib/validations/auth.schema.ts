// Zod validation schemas — mirror backend DTOs
import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(100),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(8, "Mật khẩu ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Cần có ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Cần có ít nhất 1 chữ số")
    .regex(/[^A-Za-z0-9]/, "Cần có ít nhất 1 ký tự đặc biệt"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
