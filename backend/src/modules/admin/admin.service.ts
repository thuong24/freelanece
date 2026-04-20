import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "../../common/errors/http-errors";
import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import { addDays } from "../../common/utils/date";
import type { GetUsersQueryDto, UpdateUserStatusDto, LockFeatureDto } from "./admin.dto";

// Lấy danh sách users
export const getUsers = async (query: GetUsersQueryDto) => {
  const params = getPaginationParams(query);
  const where: Prisma.UserWhereInput = {
    ...(query.status && { status: query.status }),
    ...(query.role && { role: query.role }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        ratingAvg: true,
        wallet: { select: { availableBalance: true, lockedBalance: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, meta: buildPaginationMeta(total, params) };
};

// Cập nhật trạng thái user (Ban/Suspend/Active)
export const updateUserStatus = async (id: string, dto: UpdateUserStatusDto) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("Không tìm thấy người dùng");

  const updated = await prisma.user.update({
    where: { id },
    data: { status: dto.status },
    select: { id: true, name: true, status: true },
  });

  // Có thể ghi thêm log vào bảng AdminActionLog (nếu mở rộng sau này)
  
  if (dto.status !== "ACTIVE") {
    await prisma.notification.create({
      data: {
        userId: id,
        type: "SYSTEM_ALERT",
        title: "Trạng thái tài khoản đã thay đổi",
        body: `Tài khoản của bạn đã bị chuyển sang trạng thái ${dto.status}. Lý do: ${dto.reason || "Vi phạm chính sách nền tảng"}`,
      },
    });
  }

  return updated;
};

// Khóa tính năng (POST_JOB, BID)
export const lockUserFeature = async (id: string, dto: LockFeatureDto) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("Không tìm thấy người dùng");

  const lockedUntil = addDays(new Date(), dto.days);

  const lock = await prisma.featureLock.create({
    data: {
      userId: id,
      feature: dto.feature,
      lockedUntil,
      reason: dto.reason,
    },
  });

  await prisma.notification.create({
    data: {
      userId: id,
      type: "SYSTEM_ALERT",
      title: "Tính năng bị khóa",
      body: `Tính năng ${dto.feature} của bạn đã bị khóa đến ngày ${lockedUntil.toLocaleDateString("vi-VN")}. Lý do: ${dto.reason}`,
    },
  });

  return lock;
};

// Thống kê tổng quan hệ thống
export const getSystemStats = async () => {
  const [
    totalUsers,
    totalJobs,
    totalContracts,
    totalRevenue
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.job.count(),
    prisma.contract.count(),
    prisma.walletTransaction.aggregate({
      where: { type: "PLATFORM_FEE" },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    totalJobs,
    totalContracts,
    platformRevenue: totalRevenue._sum.amount || 0,
  };
};
