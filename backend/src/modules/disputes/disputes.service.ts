import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../../common/errors/http-errors";
import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import { addDays } from "../../common/utils/date";
import * as disputesRepo from "./disputes.repository";
import * as contractsRepo from "../contracts/contracts.repository";
import type { CreateDisputeDto, ResolveDisputeDto } from "./disputes.dto";

// Tạo khiếu nại (Freelancer hoặc Client)
export const createDispute = async (userId: string, dto: CreateDisputeDto) => {
  const contract = await contractsRepo.findContractById(dto.contractId);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new ForbiddenError("Bạn không có quyền khiếu nại hợp đồng này");
  }

  if (contract.status === "DONE" || contract.status === "CANCELLED") {
    throw new BusinessRuleError("Không thể khiếu nại hợp đồng đã hoàn tất hoặc đã hủy");
  }

  const existing = await disputesRepo.findExistingPendingDispute(dto.contractId);
  if (existing) {
    throw new BusinessRuleError("Đã có một khiếu nại đang chờ xử lý cho hợp đồng này");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Tạo dispute
    const dispute = await disputesRepo.createDispute(
      {
        contractId: dto.contractId,
        openedById: userId,
        reason: dto.reason,
        attachmentsJson: dto.evidenceUrl,
      },
      tx
    );

    // 2. Chuyển trạng thái hợp đồng thành DISPUTED để đóng băng tiền
    await tx.contract.update({
      where: { id: dto.contractId },
      data: { status: "DISPUTED" },
    });

    // 3. Ghi timeline
    await tx.timeline.create({
      data: {
        contractId: dto.contractId,
        createdById: userId,
        title: "Khiếu nại được mở",
        action: "DISPUTE_OPENED",
        description: `Đã mở khiếu nại. Lý do: ${dto.reason}`,
      },
    });

    return dispute;
  });

  // Thông báo cho admin và đối tác
  const targetId = contract.clientId === userId ? contract.freelancerId : contract.clientId;
  
  await prisma.notification.create({
    data: {
      userId: targetId,
      type: "DISPUTE_OPENED",
      title: "Hợp đồng đã bị khiếu nại",
      body: `Đối tác đã mở khiếu nại với lý do: ${dto.reason}. Hợp đồng hiện đang bị khóa chờ Admin giải quyết.`,
      referenceType: "DISPUTE",
      referenceId: result.id,
    },
  });

  return result;
};

export const getDisputes = async (query: any) => {
  const params = getPaginationParams(query);
  const filters = {
    status: query.status as string | undefined,
    contractId: query.contractId as string | undefined,
  };

  const [disputes, total] = await Promise.all([
    disputesRepo.findDisputes(params.skip, params.limit, filters),
    disputesRepo.countDisputes(filters),
  ]);

  return { disputes, meta: buildPaginationMeta(total, params) };
};

export const getDisputeById = async (id: string) => {
  const dispute = await disputesRepo.findDisputeById(id);
  if (!dispute) throw new NotFoundError("Không tìm thấy khiếu nại");
  return dispute;
};

// Admin giải quyết khiếu nại
export const resolveDispute = async (id: string, adminId: string, dto: ResolveDisputeDto) => {
  const dispute = await disputesRepo.findDisputeById(id);
  if (!dispute) throw new NotFoundError("Không tìm thấy khiếu nại");

  if (dispute.status !== "OPEN") {
    throw new BusinessRuleError("Khiếu nại này đã được giải quyết hoặc đang xử lý");
  }

  const contract = await contractsRepo.findContractById(dispute.contractId);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng liên quan");

  const clientWallet = await prisma.wallet.findUnique({ where: { userId: contract.clientId } });
  const freelancerWallet = await prisma.wallet.findUnique({ where: { userId: contract.freelancerId } });

  if (!clientWallet || !freelancerWallet) {
    throw new NotFoundError("Lỗi hệ thống: Không tìm thấy ví của các bên");
  }

  const lockedAmount = contract.lockedAmount;
  const refundAmount = lockedAmount.mul(new Prisma.Decimal(dto.refundPercentage)).div(100);
  const releaseAmount = lockedAmount.sub(refundAmount);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Cập nhật trạng thái Dispute
    const resolvedDispute = await tx.dispute.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedById: adminId,
        resolvedAt: new Date(),
        adminDecision: dto.resolutionInfo,
      },
    });

    // 2. Trừ Locked Balance của Client (giải phóng toàn bộ số tiền bị khóa)
    await tx.wallet.update({
      where: { id: clientWallet.id },
      data: { lockedBalance: { decrement: lockedAmount } },
    });

    // 3. Xử lý Refund cho Client
    if (refundAmount.greaterThan(0)) {
      const updatedClientWallet = await tx.wallet.update({
        where: { id: clientWallet.id },
        data: { availableBalance: { increment: refundAmount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: clientWallet.id,
          type: "REFUND",
          amount: refundAmount,
          beforeBalance: clientWallet.availableBalance,
          afterBalance: updatedClientWallet.availableBalance,
          referenceType: "DISPUTE",
          referenceId: id,
          description: `Hoàn ${dto.refundPercentage}% tiền từ giải quyết khiếu nại #${id.slice(0, 8)}`,
        },
      });
    }

    // 4. Xử lý Release cho Freelancer
    if (releaseAmount.greaterThan(0)) {
      const updatedFreelancerWallet = await tx.wallet.update({
        where: { id: freelancerWallet.id },
        data: { availableBalance: { increment: releaseAmount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: freelancerWallet.id,
          type: "ESCROW_RELEASE",
          amount: releaseAmount,
          beforeBalance: freelancerWallet.availableBalance,
          afterBalance: updatedFreelancerWallet.availableBalance,
          referenceType: "DISPUTE",
          referenceId: id,
          description: `Nhận ${100 - dto.refundPercentage}% tiền từ giải quyết khiếu nại #${id.slice(0, 8)}`,
        },
      });
    }

    // 5. Cập nhật Hợp đồng & Job
    await tx.contract.update({
      where: { id: contract.id },
      data: { status: "CANCELLED", completedAt: new Date() },
    });

    if (contract.jobId) {
      // Nếu refund 100%, có thể mở lại job
      if (dto.refundPercentage === 100) {
        await tx.job.update({
          where: { id: contract.jobId },
          data: { status: "OPEN", bidCount: { decrement: 1 } },
        });
      } else {
        await tx.job.update({
          where: { id: contract.jobId },
          data: { status: "CLOSED" },
        });
      }
    }

    // 6. Xử phạt người dùng (Nếu có)
    if (dto.applyPenalty && dto.punishedUserId) {
      if (dto.banUser) {
        await tx.user.update({
          where: { id: dto.punishedUserId },
          data: { status: "BANNED" },
        });
      } else if (dto.lockFeature && dto.lockDays) {
        await tx.featureLock.create({
          data: {
            userId: dto.punishedUserId,
            feature: dto.lockFeature,
            lockedUntil: addDays(new Date(), dto.lockDays),
            reason: dto.penaltyReason || "Vi phạm hợp đồng",
          },
        });
      }
    }

    // 7. Timeline
    await tx.timeline.create({
      data: {
        contractId: contract.id,
        createdById: adminId,
        title: "Khiếu nại đã giải quyết",
        action: "DISPUTE_RESOLVED",
        description: `Admin đã phân xử: ${dto.resolutionInfo}. Tỷ lệ hoàn tiền: ${dto.refundPercentage}%`,
      },
    });

    return resolvedDispute;
  });

  // Thông báo kết quả cho 2 bên
  const message = `Admin đã phân xử khiếu nại. Tỷ lệ hoàn lại cho khách hàng: ${dto.refundPercentage}%. Phán quyết: ${dto.resolutionInfo}`;
  
  await prisma.notification.createMany({
    data: [
      {
        userId: contract.clientId,
        type: "DISPUTE_RESOLVED",
        title: "Kết quả giải quyết khiếu nại",
        body: message,
        referenceType: "DISPUTE",
        referenceId: id,
      },
      {
        userId: contract.freelancerId,
        type: "DISPUTE_RESOLVED",
        title: "Kết quả giải quyết khiếu nại",
        body: message,
        referenceType: "DISPUTE",
        referenceId: id,
      },
    ],
  });

  return result;
};
