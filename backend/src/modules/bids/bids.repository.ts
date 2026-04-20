import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import type { GetBidsQueryDto } from "./bids.dto";

const bidSelect = {
  id: true,
  jobId: true,
  bidderId: true,
  bidAmount: true,
  estimatedDays: true,
  message: true,
  screeningAnswer: true,
  status: true,
  usedFreeQuota: true,
  createdAt: true,
  updatedAt: true,
  bidder: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      ratingAvg: true,
      ratingCount: true,
      skills: true,
    },
  },
} as const;

// Tạo bid mới
export const createBid = (data: {
  jobId: string;
  bidderId: string;
  bidAmount: Prisma.Decimal;
  estimatedDays: number;
  message: string;
  screeningAnswer?: string;
  usedFreeQuota: boolean;
}) => {
  return prisma.bid.create({
    data: data as Parameters<typeof prisma.bid.create>[0]["data"],
    select: bidSelect,
  });
};

// Lấy tất cả bid của 1 job
export const findBidsByJobId = (jobId: string, query: GetBidsQueryDto) => {
  const where: Prisma.BidWhereInput = {
    jobId,
    ...(query.status && { status: query.status }),
  };

  return prisma.bid.findMany({
    where,
    select: bidSelect,
    orderBy: { [query.sortBy]: query.sortOrder },
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });
};

export const countBidsByJobId = (jobId: string, query: GetBidsQueryDto) => {
  return prisma.bid.count({
    where: {
      jobId,
      ...(query.status && { status: query.status }),
    },
  });
};

// Lấy bid theo ID
export const findBidById = (id: string) => {
  return prisma.bid.findUnique({
    where: { id },
    select: {
      ...bidSelect,
      job: { select: { id: true, clientId: true, status: true } },
    },
  });
};

// Lấy bid của freelancer (my bids)
export const findBidsByBidderId = (bidderId: string, skip: number, take: number) => {
  return prisma.bid.findMany({
    where: { bidderId },
    select: {
      ...bidSelect,
      job: {
        select: { id: true, title: true, status: true, budget: true, client: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
};

export const countBidsByBidderId = (bidderId: string) => {
  return prisma.bid.count({ where: { bidderId } });
};

// Kiểm tra user đã bid job này chưa
export const findExistingBid = (jobId: string, bidderId: string) => {
  return prisma.bid.findUnique({ where: { jobId_bidderId: { jobId, bidderId } } });
};

// Cập nhật bid
export const updateBid = (id: string, data: Prisma.BidUpdateInput) => {
  return prisma.bid.update({ where: { id }, data, select: bidSelect });
};

// Giảm quota bid của user
export const decrementUserBidQuota = (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { freeBidQuota: { decrement: 1 } },
  });
};
