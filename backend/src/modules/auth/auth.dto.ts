import { z } from "zod";

// Schema đăng ký tài khoản
export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được vượt quá 100 ký tự")
    .trim(),
  email: z
    .string()
    .email("Email không hợp lệ")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
    ),
});

// Schema đăng nhập
export const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ").toLowerCase().trim(),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

// Schema đăng nhập Google One Tap
export const GoogleOneTapSchema = z.object({
  credential: z.string().min(1, "Google credential không hợp lệ"),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type GoogleOneTapDto = z.infer<typeof GoogleOneTapSchema>;
