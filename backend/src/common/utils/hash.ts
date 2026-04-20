import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

// Hash password bằng bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// So sánh password với hash
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Hash token bằng SHA-256 — dùng để lưu refresh token vào DB
// Không lưu raw token, chỉ lưu hash
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Tạo chuỗi ngẫu nhiên an toàn (dùng làm token, OTP...)
export const generateSecureToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString("hex");
};
