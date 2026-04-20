import { prisma } from "../../config/prisma";
import type { UpdateProfileDto } from "./users.dto";

// Lấy thông tin đầy đủ của user hiện tại (bao gồm wallet)
export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatarUrl: true,
      bio: true,
      skills: true,
      ratingAvg: true,
      ratingCount: true,
      freePostQuota: true,
      freeBidQuota: true,
      createdAt: true,
      updatedAt: true,
      wallet: {
        select: {
          availableBalance: true,
          lockedBalance: true,
          currency: true,
        },
      },
    },
  });
};

// Lấy public profile — ẩn thông tin nhạy cảm
export const findPublicProfileById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      status: true,
      avatarUrl: true,
      bio: true,
      skills: true,
      ratingAvg: true,
      ratingCount: true,
      createdAt: true,
      // Thống kê nghề nghiệp
      _count: {
        select: {
          postedJobs: true,
          freelancerContracts: { where: { status: "DONE" } },
        },
      },
    },
  });
};

// Cập nhật thông tin profile
export const updateUserProfile = (id: string, data: UpdateProfileDto) => {
  return prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.skills && { skills: JSON.stringify(data.skills) }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatarUrl: true,
      bio: true,
      skills: true,
      ratingAvg: true,
      ratingCount: true,
      freePostQuota: true,
      freeBidQuota: true,
      updatedAt: true,
    },
  });
};

// Lấy danh sách đánh giá nhận được của user
export const findUserReviews = (
  userId: string,
  skip: number,
  take: number
) => {
  return prisma.review.findMany({
    where: { revieweeId: userId },
    include: {
      reviewer: {
        select: { id: true, name: true, avatarUrl: true },
      },
      contract: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
};

export const countUserReviews = (userId: string) => {
  return prisma.review.count({ where: { revieweeId: userId } });
};
