import { prisma } from "../../config/prisma";
import { hashToken } from "../../common/utils/hash";

// Tìm user theo email
export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

// Tìm user theo Google ID
export const findUserByGoogleId = (googleId: string) => {
  return prisma.user.findUnique({ where: { googleId } });
};

// Tìm user theo ID
export const findUserById = (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

// Tạo user mới kèm wallet — chạy trong transaction
export const createUserWithWallet = async (data: {
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        googleId: data.googleId,
      },
    });

    await tx.wallet.create({
      data: {
        userId: user.id,
        availableBalance: 0,
        lockedBalance: 0,
        currency: "VND",
      },
    });

    return user;
  });
};

// Lưu refresh token vào DB (lưu dạng hash)
export const saveRefreshToken = (data: {
  userId: string;
  rawToken: string;
  expiresAt: Date;
  deviceInfo?: string;
}) => {
  return prisma.refreshToken.create({
    data: {
      userId: data.userId,
      tokenHash: hashToken(data.rawToken),
      expiresAt: data.expiresAt,
      deviceInfo: data.deviceInfo,
    },
  });
};

// Tìm refresh token theo hash
export const findRefreshTokenByHash = (rawToken: string) => {
  return prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: { select: { id: true, role: true, status: true } } },
  });
};

// Thu hồi refresh token (ghi revokedAt)
export const revokeRefreshToken = (id: string) => {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
};

// Thu hồi tất cả refresh token của user (logout all devices)
export const revokeAllUserRefreshTokens = (userId: string) => {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
