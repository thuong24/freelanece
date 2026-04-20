import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

const contractSelect = {
  id: true,
  jobId: true,
  clientId: true,
  freelancerId: true,
  status: true,
  lockedAmount: true,
  deadlineAt: true,
  submittedAt: true,
  completedAt: true,
  penaltyAmount: true,
  demoUrl: true,
  sourceCodeUrl: true,
  readmeConfirmed: true,
  budget: true,
  platformFeeRate: true,
  createdAt: true,
  updatedAt: true,
  client: { select: { id: true, name: true, avatarUrl: true, ratingAvg: true } },
  freelancer: { select: { id: true, name: true, avatarUrl: true, ratingAvg: true } },
  job: { select: { id: true, title: true, status: true } },
  extensionRequest: true,
  mutualCancel: true,
} as const;

// Tạo hợp đồng
export const createContract = (data: Prisma.ContractUncheckedCreateInput, tx?: Prisma.TransactionClient) => {
  const db = tx || prisma;
  return db.contract.create({
    data,
    select: contractSelect,
  });
};

// Lấy chi tiết hợp đồng
export const findContractById = (id: string) => {
  return prisma.contract.findUnique({
    where: { id },
    select: contractSelect,
  });
};

// Cập nhật hợp đồng
export const updateContract = (
  id: string,
  data: Prisma.ContractUncheckedUpdateInput,
  tx?: Prisma.TransactionClient
) => {
  const db = tx || prisma;
  return db.contract.update({
    where: { id },
    data,
    select: contractSelect,
  });
};

// Lấy hợp đồng của người dùng
export const findContractsByUser = (
  userId: string,
  skip: number,
  take: number,
  status?: string
) => {
  const where: Prisma.ContractWhereInput = {
    OR: [{ clientId: userId }, { freelancerId: userId }],
    ...(status && { status: status as any }),
  };

  return prisma.contract.findMany({
    where,
    select: contractSelect,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
};

export const countContractsByUser = (userId: string, status?: string) => {
  const where: Prisma.ContractWhereInput = {
    OR: [{ clientId: userId }, { freelancerId: userId }],
    ...(status && { status: status as any }),
  };
  return prisma.contract.count({ where });
};

// Lấy các contract cần xử lý tự động (quá deadline hoặc chờ auto-release)
export const findLateContracts = () => {
  return prisma.contract.findMany({
    where: {
      status: "IN_PROGRESS",
      deadlineAt: { lt: new Date() },
    },
  });
};
