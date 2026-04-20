import { prisma } from "../../config/prisma";
import {
  NotFoundError,
  BusinessRuleError,
  ConflictError,
} from "../../common/errors/http-errors";
import { ERROR_CODES } from "../../common/constants/error-codes";
import { APP_CONSTANTS } from "../../common/constants/app.constants";
import { addDays } from "../../common/utils/date";
import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import * as walletsRepo from "./wallets.repository";
import type { GetTransactionsQueryDto, DepositDto, WithdrawDto } from "./wallets.dto";

// Lấy thông tin ví của user đang đăng nhập
export const getMyWallet = async (userId: string) => {
  const wallet = await walletsRepo.findWalletByUserId(userId);
  if (!wallet) throw new NotFoundError("Không tìm thấy ví điện tử");
  return wallet;
};

// Lấy lịch sử giao dịch của ví
export const getMyTransactions = async (userId: string, query: GetTransactionsQueryDto) => {
  const wallet = await walletsRepo.findWalletByUserId(userId);
  if (!wallet) throw new NotFoundError("Không tìm thấy ví điện tử");

  const params = getPaginationParams(query);
  const [transactions, total] = await Promise.all([
    walletsRepo.findTransactionsByWalletId(wallet.id, query),
    walletsRepo.countTransactionsByWalletId(wallet.id, query),
  ]);

  return { transactions, meta: buildPaginationMeta(total, params) };
};

// Nạp tiền vào ví — webhook từ cổng thanh toán
export const deposit = async (userId: string, dto: DepositDto) => {
  // Chống double deposit
  const existing = await walletsRepo.findDepositLogByGatewayId(dto.gatewayTransactionId);
  if (existing) {
    throw new ConflictError("Giao dịch nạp tiền này đã được xử lý trước đó");
  }

  const wallet = await walletsRepo.findWalletByUserId(userId);
  if (!wallet) throw new NotFoundError("Không tìm thấy ví điện tử");

  const amount = new (await import("@prisma/client")).Prisma.Decimal(dto.amount);

  const result = await prisma.$transaction(async (tx) => {
    // Cộng available balance
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: { increment: amount },
      },
    });

    // Ghi wallet transaction log
    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "DEPOSIT",
        amount,
        beforeBalance: wallet.availableBalance,
        afterBalance: updatedWallet.availableBalance,
        referenceType: "DEPOSIT_LOG",
        referenceId: dto.gatewayTransactionId,
        description: `Nạp tiền qua ${dto.paymentGateway}: ${dto.amount.toLocaleString("vi-VN")} VNĐ`,
      },
    });

    // Ghi deposit log (raw webhook data)
    await tx.depositLog.create({
      data: {
        userId,
        amount,
        gateway: dto.paymentGateway,
        gatewayTransactionId: dto.gatewayTransactionId,
        gatewaySignature: dto.gatewaySignature,
        status: "SUCCESS",
        processedAt: new Date(),
      },
    });

    return { wallet: updatedWallet, transaction };
  });

  return result;
};

// Rút tiền về tài khoản ngân hàng
export const withdraw = async (userId: string, dto: WithdrawDto) => {
  const wallet = await walletsRepo.findWalletByUserId(userId);
  if (!wallet) throw new NotFoundError("Không tìm thấy ví điện tử");

  // Kiểm tra hold (tiền vừa nhận chưa đủ thời gian)
  if (wallet.holdUntil && wallet.holdUntil > new Date()) {
    const holdDate = wallet.holdUntil.toLocaleDateString("vi-VN");
    throw new BusinessRuleError(
      `Số dư đang bị tạm giữ đến ngày ${holdDate}. Vui lòng thử lại sau khi hết thời gian giữ tiền.`,
      ERROR_CODES.WITHDRAW_HOLD_ACTIVE
    );
  }

  const { Prisma: PrismaLib } = await import("@prisma/client");
  const amount = new PrismaLib.Decimal(dto.amount);

  // Kiểm tra số dư đủ không
  if (wallet.availableBalance.lessThan(amount)) {
    throw new BusinessRuleError(
      `Số dư khả dụng không đủ. Số dư hiện tại: ${wallet.availableBalance.toNumber().toLocaleString("vi-VN")} VNĐ`,
      ERROR_CODES.INSUFFICIENT_BALANCE
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Trừ available balance
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        availableBalance: { decrement: amount },
      },
    });

    // Ghi transaction log
    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "WITHDRAW",
        amount,
        beforeBalance: wallet.availableBalance,
        afterBalance: updatedWallet.availableBalance,
        description: `Rút tiền về ${dto.bankName} - ${dto.bankAccountNumber} (${dto.bankAccountName})`,
      },
    });

    return { wallet: updatedWallet, transaction };
  });

  // TODO: Gọi API ngân hàng để chuyển tiền thực tế
  // await bankService.transfer(dto);

  return result;
};
