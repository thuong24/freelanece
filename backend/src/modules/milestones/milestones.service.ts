import { prisma } from "../../config/prisma";
import { NotFoundError, ForbiddenError, BusinessRuleError } from "../../common/errors/http-errors";
import { Prisma } from "@prisma/client";
import * as contractsRepo from "../contracts/contracts.repository";
import type { CreateMilestoneDto, SubmitMilestoneDto } from "./milestones.dto";

export const createMilestones = async (contractId: string, userId: string, dtos: CreateMilestoneDto[]) => {
  const contract = await contractsRepo.findContractById(contractId);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");
  if (contract.clientId !== userId) throw new ForbiddenError("Chỉ client mới được tạo milestone");
  
  if (contract.status !== "PENDING" && contract.status !== "IN_PROGRESS") {
    throw new BusinessRuleError("Hợp đồng không ở trạng thái cho phép tạo milestone");
  }

  const totalAmount = dtos.reduce((sum, dto) => sum + dto.amount, 0);
  if (totalAmount > Number(contract.budget)) {
    throw new BusinessRuleError("Tổng tiền các milestone không được vượt quá ngân sách hợp đồng");
  }

  return prisma.$transaction(async (tx) => {
    // Xóa các milestone cũ chưa hoàn thành nếu cập nhật lại
    await tx.milestone.deleteMany({
      where: { contractId, status: "PENDING" }
    });

    const created = await Promise.all(
      dtos.map((dto) =>
        tx.milestone.create({
          data: {
            contractId,
            title: dto.title,
            amount: dto.amount,
            dueDate: new Date(dto.dueDate),
            orderIndex: dto.orderIndex,
          },
        })
      )
    );

    return created;
  });
};

export const submitMilestone = async (id: string, userId: string, dto: SubmitMilestoneDto) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { contract: true },
  });

  if (!milestone) throw new NotFoundError("Không tìm thấy milestone");
  if (milestone.contract.freelancerId !== userId) {
    throw new ForbiddenError("Bạn không có quyền nộp kết quả milestone này");
  }
  if (milestone.status !== "PENDING") {
    throw new BusinessRuleError("Milestone không ở trạng thái PENDING");
  }

  const updated = await prisma.milestone.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      demoUrl: dto.demoUrl,
      note: dto.note,
      submittedAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: milestone.contract.clientId,
      type: "MILESTONE_SUBMITTED",
      title: "Milestone đã được nộp",
      body: `Freelancer đã nộp kết quả cho milestone "${milestone.title}"`,
      referenceType: "MILESTONE",
      referenceId: id,
    },
  });

  return updated;
};

export const approveMilestone = async (id: string, userId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { contract: true },
  });

  if (!milestone) throw new NotFoundError("Không tìm thấy milestone");
  if (milestone.contract.clientId !== userId) {
    throw new ForbiddenError("Bạn không có quyền duyệt milestone này");
  }
  if (milestone.status !== "SUBMITTED") {
    throw new BusinessRuleError("Milestone chưa được nộp kết quả");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.milestone.update({
      where: { id },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    const clientWallet = await tx.wallet.findUnique({ where: { userId: milestone.contract.clientId } });
    const freelancerWallet = await tx.wallet.findUnique({ where: { userId: milestone.contract.freelancerId } });

    if (!clientWallet || !freelancerWallet) {
      throw new NotFoundError("Lỗi hệ thống: Không tìm thấy ví");
    }

    const platformFeeRate = new Prisma.Decimal(0.05); // Lấy từ config thực tế
    const amountToRelease = milestone.amount;
    const feeAmount = amountToRelease.mul(platformFeeRate);
    const finalAmount = amountToRelease.sub(feeAmount);

    // Trừ locked client
    await tx.wallet.update({
      where: { id: clientWallet.id },
      data: { lockedBalance: { decrement: amountToRelease } },
    });

    // Cộng available freelancer
    const updatedFreelancer = await tx.wallet.update({
      where: { id: freelancerWallet.id },
      data: { availableBalance: { increment: finalAmount } },
    });

    // Log transaction
    await tx.walletTransaction.create({
      data: {
        walletId: freelancerWallet.id,
        type: "MILESTONE_RELEASE",
        amount: finalAmount,
        beforeBalance: freelancerWallet.availableBalance,
        afterBalance: updatedFreelancer.availableBalance,
        referenceType: "MILESTONE",
        referenceId: id,
        description: `Giải ngân milestone: ${milestone.title}`,
      },
    });

    return updated;
  });

  await prisma.notification.create({
    data: {
      userId: milestone.contract.freelancerId,
      type: "MILESTONE_APPROVED",
      title: "Milestone đã được duyệt",
      body: `Khách hàng đã duyệt milestone "${milestone.title}". Tiền đã được cộng vào ví của bạn.`,
      referenceType: "MILESTONE",
      referenceId: id,
    },
  });

  return result;
};
