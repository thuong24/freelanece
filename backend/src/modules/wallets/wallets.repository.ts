import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import type { GetTransactionsQueryDto } from "./wallets.dto";

// Lấy ví của user
export const findWalletByUserId = (userId: string) => {
  return prisma.wallet.findUnique({
    where: { userId },
  });
};

// Lấy ví kèm lock để dùng trong transaction
export const findWalletForUpdate = (userId: string, tx: Prisma.TransactionClient) => {
  return tx.wallet.findUnique({ where: { userId } });
};

// Lấy lịch sử giao dịch của ví
export const findTransactionsByWalletId = (
  walletId: string,
  query: GetTransactionsQueryDto
) => {
  const where: Prisma.WalletTransactionWhereInput = {
    walletId,
    ...(query.type && { type: query.type }),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from && { gte: new Date(query.from) }),
            ...(query.to && { lte: new Date(query.to) }),
          },
        }
      : {}),
  };

  return prisma.walletTransaction.findMany({
    where,
    orderBy: { createdAt: query.sortOrder ?? "desc" },
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });
};

export const countTransactionsByWalletId = (
  walletId: string,
  query: GetTransactionsQueryDto
) => {
  const where: Prisma.WalletTransactionWhereInput = {
    walletId,
    ...(query.type && { type: query.type }),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from && { gte: new Date(query.from) }),
            ...(query.to && { lte: new Date(query.to) }),
          },
        }
      : {}),
  };
  return prisma.walletTransaction.count({ where });
};

// Kiểm tra giao dịch nạp tiền đã tồn tại chưa (tránh double deposit)
export const findDepositLogByGatewayId = (gatewayTransactionId: string) => {
  return prisma.depositLog.findUnique({ where: { gatewayTransactionId } });
};
