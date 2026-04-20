import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

const disputeSelect = {
  id: true,
  contractId: true,
  openedById: true,
  status: true,
  reason: true,
  attachmentsJson: true,
  adminDecision: true,
  createdAt: true,
  updatedAt: true,
  openedBy: { select: { id: true, name: true, role: true } },
  contract: {
    select: {
      id: true,
      status: true,
      lockedAmount: true,
      client: { select: { id: true, name: true } },
      freelancer: { select: { id: true, name: true } },
    },
  },
} as const;

export const createDispute = (data: Prisma.DisputeCreateInput, tx?: Prisma.TransactionClient) => {
  const db = tx || prisma;
  return db.dispute.create({ data, select: disputeSelect });
};

export const findDisputeById = (id: string) => {
  return prisma.dispute.findUnique({ where: { id }, select: disputeSelect });
};

export const findDisputes = (skip: number, take: number, filters?: { status?: string, contractId?: string }) => {
  const where: Prisma.DisputeWhereInput = {
    ...(filters?.status && { status: filters.status as any }),
    ...(filters?.contractId && { contractId: filters.contractId }),
  };

  return prisma.dispute.findMany({
    where,
    select: disputeSelect,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
};

export const countDisputes = (filters?: { status?: string, contractId?: string }) => {
  const where: Prisma.DisputeWhereInput = {
    ...(filters?.status && { status: filters.status as any }),
    ...(filters?.contractId && { contractId: filters.contractId }),
  };
  return prisma.dispute.count({ where });
};

export const findExistingPendingDispute = (contractId: string) => {
  return prisma.dispute.findFirst({
    where: { contractId, status: "OPEN" },
  });
};
