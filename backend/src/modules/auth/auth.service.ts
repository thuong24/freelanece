import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env";
import { signAccessToken, signRefreshToken, getRefreshTokenExpiry } from "../../config/jwt";
import { hashPassword, comparePassword } from "../../common/utils/hash";
import { APP_CONSTANTS } from "../../common/constants/app.constants";
import {
  ConflictError,
  UnauthorizedError,
  BusinessRuleError,
} from "../../common/errors/http-errors";
import { ERROR_CODES } from "../../common/constants/error-codes";
import * as authRepo from "./auth.repository";
import type { RegisterDto, LoginDto, GoogleOneTapDto } from "./auth.dto";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// ── Helpers ──────────────────────────────────────────────────

const buildTokenPair = async (userId: string, role: string, deviceInfo?: string) => {
  const accessToken = signAccessToken({ userId, role });
  const rawRefreshToken = signRefreshToken({ userId, tokenId: "" }); // tokenId sẽ cập nhật sau nếu cần

  await authRepo.saveRefreshToken({
    userId,
    rawToken: rawRefreshToken,
    expiresAt: getRefreshTokenExpiry(),
    deviceInfo,
  });

  return { accessToken, rawRefreshToken };
};

// ── Service methods ──────────────────────────────────────────

// Đăng ký tài khoản mới
export const register = async (dto: RegisterDto, deviceInfo?: string) => {
  // Kiểm tra email đã tồn tại chưa
  const existing = await authRepo.findUserByEmail(dto.email);
  if (existing) {
    throw new ConflictError("Email này đã được đăng ký, vui lòng dùng email khác");
  }

  const passwordHash = await hashPassword(dto.password);

  const user = await authRepo.createUserWithWallet({
    name: dto.name,
    email: dto.email,
    passwordHash,
  });

  const { accessToken, rawRefreshToken } = await buildTokenPair(user.id, user.role, deviceInfo);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      freePostQuota: user.freePostQuota,
      freeBidQuota: user.freeBidQuota,
      createdAt: user.createdAt,
    },
    accessToken,
    rawRefreshToken,
  };
};

// Đăng nhập bằng email/password
export const login = async (dto: LoginDto, deviceInfo?: string) => {
  const user = await authRepo.findUserByEmail(dto.email);

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("Email hoặc mật khẩu không chính xác");
  }

  const isMatch = await comparePassword(dto.password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError("Email hoặc mật khẩu không chính xác");
  }

  if (user.status === "BANNED") {
    throw new BusinessRuleError("Tài khoản của bạn đã bị khóa vĩnh viễn", ERROR_CODES.ACCOUNT_BANNED);
  }

  if (user.status === "SUSPENDED") {
    throw new BusinessRuleError("Tài khoản của bạn đang bị tạm đình chỉ", ERROR_CODES.ACCOUNT_SUSPENDED);
  }

  const { accessToken, rawRefreshToken } = await buildTokenPair(user.id, user.role, deviceInfo);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      freePostQuota: user.freePostQuota,
      freeBidQuota: user.freeBidQuota,
      createdAt: user.createdAt,
    },
    accessToken,
    rawRefreshToken,
  };
};

// Refresh access token từ refresh token trong cookie
export const refreshToken = async (rawRefreshToken: string, deviceInfo?: string) => {
  const tokenRecord = await authRepo.findRefreshTokenByHash(rawRefreshToken);

  if (!tokenRecord) {
    throw new UnauthorizedError("Refresh token không hợp lệ, vui lòng đăng nhập lại");
  }

  // Kiểm tra đã bị thu hồi chưa
  if (tokenRecord.revokedAt) {
    // Token đã bị dùng lại — có thể bị đánh cắp → thu hồi tất cả
    await authRepo.revokeAllUserRefreshTokens(tokenRecord.userId);
    throw new UnauthorizedError("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại");
  }

  // Kiểm tra hết hạn
  if (tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  }

  const { user } = tokenRecord;
  if (user.status === "BANNED") {
    throw new BusinessRuleError("Tài khoản của bạn đã bị khóa", ERROR_CODES.ACCOUNT_BANNED);
  }

  // Thu hồi token cũ (token rotation)
  await authRepo.revokeRefreshToken(tokenRecord.id);

  // Cấp token mới
  const { accessToken, rawRefreshToken: newRefreshToken } = await buildTokenPair(
    user.id,
    user.role,
    deviceInfo
  );

  return { accessToken, rawRefreshToken: newRefreshToken };
};

// Đăng xuất — thu hồi refresh token
export const logout = async (rawRefreshToken: string) => {
  const tokenRecord = await authRepo.findRefreshTokenByHash(rawRefreshToken);
  if (tokenRecord && !tokenRecord.revokedAt) {
    await authRepo.revokeRefreshToken(tokenRecord.id);
  }
};

// Đăng nhập bằng Google One Tap
export const googleOneTap = async (dto: GoogleOneTapDto, deviceInfo?: string) => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new BusinessRuleError("Đăng nhập Google chưa được cấu hình");
  }

  // Verify Google credential
  const ticket = await googleClient.verifyIdToken({
    idToken: dto.credential,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new UnauthorizedError("Google token không hợp lệ");
  }

  // Tìm user theo google_id trước, rồi theo email
  let user = await authRepo.findUserByGoogleId(payload.sub);

  if (!user) {
    user = await authRepo.findUserByEmail(payload.email);

    if (user) {
      // Email đã tồn tại nhưng chưa liên kết Google — có thể link hoặc báo lỗi
      // Ở đây chọn: liên kết tự động
      const { prisma } = await import("../../config/prisma");
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub },
      });
    } else {
      // Tạo tài khoản mới qua Google
      user = await authRepo.createUserWithWallet({
        name: payload.name ?? payload.email.split("@")[0],
        email: payload.email,
        googleId: payload.sub,
      });
    }
  }

  if (user.status === "BANNED") {
    throw new BusinessRuleError("Tài khoản của bạn đã bị khóa", ERROR_CODES.ACCOUNT_BANNED);
  }

  const { accessToken, rawRefreshToken } = await buildTokenPair(user.id, user.role, deviceInfo);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      freePostQuota: user.freePostQuota,
      freeBidQuota: user.freeBidQuota,
      createdAt: user.createdAt,
    },
    accessToken,
    rawRefreshToken,
  };
};
