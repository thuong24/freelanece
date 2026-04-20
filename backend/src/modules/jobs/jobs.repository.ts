import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import type { GetJobsQueryDto } from "./jobs.dto";

// Select fields dùng chung cho list view
const jobListSelect = {
  id: true,
  clientId: true,
  title: true,
  description: true,
  budget: true,
  deadlineDays: true,
  status: true,
  isBumped: true,
  bumpedAt: true,
  freeQuotaUsed: true,
  codeQualityRequirement: true,
  screeningQuestion: true,
  bidCount: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: { id: true, name: true, avatarUrl: true, ratingAvg: true },
  },
} as const;

// Tạo job mới
export const createJob = (data: {
  clientId: string;
  title: string;
  description: string;
  budget: Prisma.Decimal;
  deadlineDays: number;
  codeQualityRequirement: string;
  screeningQuestion?: string;
  isBumped: boolean;
  freeQuotaUsed: boolean;
  bumpedAt?: Date;
}) => {
  return prisma.job.create({
    data: data as Parameters<typeof prisma.job.create>[0]["data"],
    select: jobListSelect,
  });
};

// Lấy danh sách job với sort & filter
// Ưu tiên: bumped trước → mới nhất sau
export const findJobs = (query: GetJobsQueryDto) => {
  const where: Prisma.JobWhereInput = {
    ...(query.status ? { status: query.status } : { status: "OPEN" }), // mặc định chỉ hiện OPEN
    ...(query.search && {
      OR: [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ],
    }),
    ...(query.minBudget && { budget: { gte: new Prisma.Decimal(query.minBudget) } }),
    ...(query.maxBudget && { budget: { lte: new Prisma.Decimal(query.maxBudget) } }),
    ...(query.codeQualityRequirement && {
      codeQualityRequirement: query.codeQualityRequirement,
    }),
  };

  return prisma.job.findMany({
    where,
    select: jobListSelect,
    orderBy: [
      { isBumped: "desc" },   // bumped lên đầu
      { bumpedAt: "desc" },   // bumped gần đây nhất
      { [query.sortBy === "bumped" ? "bumpedAt" : query.sortBy]: query.sortOrder }, // sau đó sort theo yêu cầu
    ],
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });
};

export const countJobs = (query: GetJobsQueryDto) => {
  const where: Prisma.JobWhereInput = {
    ...(query.status ? { status: query.status } : { status: "OPEN" }),
    ...(query.search && {
      OR: [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ],
    }),
    ...(query.minBudget && { budget: { gte: new Prisma.Decimal(query.minBudget) } }),
    ...(query.maxBudget && { budget: { lte: new Prisma.Decimal(query.maxBudget) } }),
    ...(query.codeQualityRequirement && {
      codeQualityRequirement: query.codeQualityRequirement,
    }),
  };
  return prisma.job.count({ where });
};

// Lấy chi tiết job theo ID
export const findJobById = (id: string) => {
  return prisma.job.findUnique({
    where: { id },
    select: {
      ...jobListSelect,
      _count: { select: { bids: true } },
    },
  });
};

// Lấy job của client (my jobs)
export const findJobsByClientId = (clientId: string, skip: number, take: number) => {
  return prisma.job.findMany({
    where: { clientId },
    select: jobListSelect,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
};

export const countJobsByClientId = (clientId: string) => {
  return prisma.job.count({ where: { clientId } });
};

// Cập nhật job
export const updateJob = (id: string, data: Prisma.JobUpdateInput) => {
  return prisma.job.update({
    where: { id },
    data,
    select: jobListSelect,
  });
};

// Xóa job
export const deleteJob = (id: string) => {
  return prisma.job.delete({ where: { id } });
};

// Cập nhật quota đăng bài của user
export const decrementUserPostQuota = (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { freePostQuota: { decrement: 1 } },
  });
};
