import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../../common/errors/http-errors";
import { ERROR_CODES } from "../../common/constants/error-codes";
import { APP_CONSTANTS } from "../../common/constants/app.constants";
import { addDays } from "../../common/utils/date";
import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import * as contractsRepo from "./contracts.repository";
import * as jobsRepo from "../jobs/jobs.repository";
import * as bidsRepo from "../bids/bids.repository";
import type {
  AcceptBidDto,
  SubmitDemoDto,
  SubmitFinalDto,
  RejectOrRevisionDto,
} from "./contracts.dto";

// Helper: Kiểm tra quyền truy cập contract
const verifyContractParticipant = (contract: any, userId: string) => {
  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new ForbiddenError("Bạn không có quyền truy cập hợp đồng này");
  }
  return {
    isClient: contract.clientId === userId,
    isFreelancer: contract.freelancerId === userId,
  };
};

// ── 1. Init Contract (Chốt deal & Giam tiền) ────────────────

export const acceptBid = async (userId: string, dto: AcceptBidDto) => {
  const bid = await bidsRepo.findBidById(dto.bidId);
  if (!bid || !bid.job) throw new NotFoundError("Không tìm thấy giá thầu này");

  if (bid.job.clientId !== userId) {
    throw new ForbiddenError("Bạn không có quyền duyệt giá thầu cho bài đăng này");
  }

  if (bid.job.status !== "OPEN") {
    throw new BusinessRuleError("Bài đăng này không còn mở", ERROR_CODES.JOB_CLOSED);
  }

  if (bid.status !== "PENDING") {
    throw new BusinessRuleError("Giá thầu này không còn ở trạng thái chờ duyệt", ERROR_CODES.BID_NOT_PENDING);
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new NotFoundError("Không tìm thấy ví điện tử");

  if (wallet.availableBalance.lessThan(bid.bidAmount)) {
    throw new BusinessRuleError(
      `Số dư khả dụng không đủ để thanh toán. Bạn cần ${bid.bidAmount.toNumber().toLocaleString("vi-VN")} VNĐ`,
      ERROR_CODES.INSUFFICIENT_BALANCE
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Cập nhật ví client (trừ available, cộng locked)
    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: {
        availableBalance: { decrement: bid.bidAmount },
        lockedBalance: { increment: bid.bidAmount },
      },
    });

    // 2. Ghi log ví
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "ESCROW_LOCK",
        amount: bid.bidAmount,
        beforeBalance: wallet.availableBalance,
        afterBalance: updatedWallet.availableBalance,
        description: `Ký quỹ hợp đồng cho bài đăng #${bid.jobId.slice(0, 8)}`,
      },
    });

    // 3. Tạo hợp đồng
    const contract = await contractsRepo.createContract(
      {
        jobId: bid.jobId,
        clientId: userId,
        freelancerId: bid.bidderId,
        bidId: bid.id,
        status: "IN_PROGRESS",
        budget: bid.bidAmount,
        lockedAmount: bid.bidAmount,
        deadlineAt: addDays(new Date(), bid.estimatedDays),
      },
      tx
    );

    // 4. Cập nhật trạng thái Bid
    await tx.bid.update({
      where: { id: bid.id },
      data: { status: "ACCEPTED" },
    });

    // Từ chối các bid khác
    await tx.bid.updateMany({
      where: { jobId: bid.jobId, id: { not: bid.id }, status: "PENDING" },
      data: { status: "REJECTED" },
    });

    // 5. Cập nhật trạng thái Job
    await tx.job.update({
      where: { id: bid.jobId },
      data: { status: "ASSIGNED" },
    });

    // 6. Tạo timeline event khởi tạo
    await tx.timeline.create({
      data: {
        contractId: contract.id,
        createdById: userId,
        title: "Khởi tạo hợp đồng",
        action: "CONTRACT_CREATED",
        description: "Hợp đồng được khởi tạo và số tiền đã được ký quỹ",
      },
    });

    return contract;
  });

  // Gửi thông báo cho freelancer
  await prisma.notification.create({
    data: {
      userId: bid.bidderId,
      type: "BID_ACCEPTED",
      title: "Giá thầu đã được chấp nhận!",
      body: `Khách hàng đã chấp nhận giá thầu của bạn và tiền đã được ký quỹ. Bắt đầu làm việc ngay nhé.`,
      referenceType: "CONTRACT",
      referenceId: result.id,
    },
  });

  return result;
};

// ── 2. Xem hợp đồng ─────────────────────────────────────────

export const getContracts = async (userId: string, query: any) => {
  const params = getPaginationParams(query);
  const status = query.status as string | undefined;

  const [contracts, total] = await Promise.all([
    contractsRepo.findContractsByUser(userId, params.skip, params.limit, status),
    contractsRepo.countContractsByUser(userId, status),
  ]);

  return { contracts, meta: buildPaginationMeta(total, params) };
};

export const getContractById = async (id: string, userId: string) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  verifyContractParticipant(contract, userId);

  return contract;
};

// ── 3. Delivery Flow ────────────────────────────────────────

// Freelancer nộp demo
export const submitDemo = async (id: string, userId: string, dto: SubmitDemoDto) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isFreelancer } = verifyContractParticipant(contract, userId);
  if (!isFreelancer) throw new ForbiddenError("Chỉ freelancer mới có thể nộp bản demo");

  if (contract.status !== "IN_PROGRESS" && contract.status !== "REVISION_REQUESTED") {
    throw new BusinessRuleError("Hợp đồng không ở trạng thái cho phép nộp demo", ERROR_CODES.CONTRACT_INVALID_STATUS);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await contractsRepo.updateContract(
      id,
      {
        status: "WAITING_DEMO_APPROVAL",
        demoUrl: dto.demoUrl,
      },
      tx
    );

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Nộp bản demo",
        action: "DEMO_SUBMITTED",
        description: dto.message || "Đã nộp bản demo để xét duyệt",
      },
    });

    return updated;
  });

  await prisma.notification.create({
    data: {
      userId: contract.clientId,
      type: "DEMO_SUBMITTED",
      title: "Bản demo đã được nộp",
      body: `Freelancer vừa nộp bản demo cho hợp đồng #${id.slice(0, 8)}. Vui lòng kiểm tra.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

// Client duyệt demo
export const approveDemo = async (id: string, userId: string) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isClient } = verifyContractParticipant(contract, userId);
  if (!isClient) throw new ForbiddenError("Chỉ khách hàng mới có thể duyệt bản demo");

  if (contract.status !== "WAITING_DEMO_APPROVAL") {
    throw new BusinessRuleError("Hợp đồng không ở trạng thái chờ duyệt demo", ERROR_CODES.CONTRACT_INVALID_STATUS);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await contractsRepo.updateContract(
      id,
      { status: "WAITING_SOURCE_CODE" },
      tx
    );

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Duyệt demo",
        action: "DEMO_APPROVED",
        description: "Bản demo đã được chấp thuận",
      },
    });

    return updated;
  });

  await prisma.notification.create({
    data: {
      userId: contract.freelancerId,
      type: "DEMO_APPROVED",
      title: "Bản demo đã được duyệt",
      body: `Khách hàng đã duyệt bản demo. Vui lòng nộp source code cuối cùng.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

// Client từ chối demo
export const rejectDemo = async (id: string, userId: string, dto: RejectOrRevisionDto) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isClient } = verifyContractParticipant(contract, userId);
  if (!isClient) throw new ForbiddenError("Chỉ khách hàng mới có thể từ chối bản demo");

  if (contract.status !== "WAITING_DEMO_APPROVAL") {
    throw new BusinessRuleError("Hợp đồng không ở trạng thái chờ duyệt demo", ERROR_CODES.CONTRACT_INVALID_STATUS);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await contractsRepo.updateContract(
      id,
      { status: "IN_PROGRESS" },
      tx
    );

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Từ chối demo",
        action: "DEMO_REJECTED",
        description: `Từ chối demo với lý do: ${dto.reason}`,
      },
    });

    return updated;
  });

  await prisma.notification.create({
    data: {
      userId: contract.freelancerId,
      type: "DEMO_REJECTED",
      title: "Bản demo đã bị từ chối",
      body: `Khách hàng yêu cầu sửa lại demo. Lý do: ${dto.reason}`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

// Freelancer nộp source code (final)
export const submitFinal = async (id: string, userId: string, dto: SubmitFinalDto) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isFreelancer } = verifyContractParticipant(contract, userId);
  if (!isFreelancer) throw new ForbiddenError("Chỉ freelancer mới có thể nộp source code");

  if (contract.status !== "WAITING_SOURCE_CODE" && contract.status !== "REVISION_REQUESTED") {
    throw new BusinessRuleError("Hợp đồng không ở trạng thái cho phép nộp source code", ERROR_CODES.CONTRACT_INVALID_STATUS);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await contractsRepo.updateContract(
      id,
      {
        status: "WAITING_FOR_REVIEW",
        sourceCodeUrl: dto.sourceCodeUrl,
        readmeConfirmed: dto.readmeConfirmed,
        submittedAt: new Date(),
      },
      tx
    );

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Nộp Source Code",
        action: "SOURCE_CODE_SUBMITTED",
        description: dto.message || "Đã nộp source code cuối cùng",
      },
    });

    return updated;
  });

  await prisma.notification.create({
    data: {
      userId: contract.clientId,
      type: "SOURCE_CODE_SUBMITTED",
      title: "Source code đã được nộp",
      body: `Freelancer đã nộp source code. Bạn có ${APP_CONSTANTS.AUTO_RELEASE_HOURS} giờ để kiểm tra và nghiệm thu.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

// Client yêu cầu sửa code
export const requestRevision = async (id: string, userId: string, dto: RejectOrRevisionDto) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isClient } = verifyContractParticipant(contract, userId);
  if (!isClient) throw new ForbiddenError("Chỉ khách hàng mới có thể yêu cầu sửa lại");

  if (contract.status !== "WAITING_FOR_REVIEW") {
    throw new BusinessRuleError("Hợp đồng không ở trạng thái chờ nghiệm thu", ERROR_CODES.CONTRACT_INVALID_STATUS);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await contractsRepo.updateContract(
      id,
      { status: "REVISION_REQUESTED" },
      tx
    );

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Yêu cầu chỉnh sửa",
        action: "REVISION_REQUESTED",
        description: `Yêu cầu sửa lại: ${dto.reason}`,
      },
    });

    return updated;
  });

  await prisma.notification.create({
    data: {
      userId: contract.freelancerId,
      type: "REVISION_REQUESTED",
      title: "Khách hàng yêu cầu sửa lại code",
      body: `Vui lòng sửa lại source code theo yêu cầu: ${dto.reason}`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

// ── 4. Finish Contract (Giải ngân) ──────────────────────────

export const acceptContract = async (id: string, userId: string) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isClient } = verifyContractParticipant(contract, userId);
  if (!isClient) throw new ForbiddenError("Chỉ khách hàng mới có thể nghiệm thu hợp đồng");

  if (contract.status !== "WAITING_FOR_REVIEW") {
    throw new BusinessRuleError("Hợp đồng không ở trạng thái chờ nghiệm thu", ERROR_CODES.CONTRACT_INVALID_STATUS);
  }

  const clientWallet = await prisma.wallet.findUnique({ where: { userId: contract.clientId } });
  const freelancerWallet = await prisma.wallet.findUnique({ where: { userId: contract.freelancerId } });

  if (!clientWallet || !freelancerWallet) {
    throw new NotFoundError("Lỗi hệ thống: Không tìm thấy ví điện tử của các bên");
  }

  // Tiền trừ phạt (nếu có) - late penalty cron đã set penaltyAmount
  let finalAmount = contract.lockedAmount;
  if (contract.penaltyAmount && contract.penaltyAmount.greaterThan(0)) {
    finalAmount = finalAmount.sub(contract.penaltyAmount);
  }

  const platformFeeRate = new Prisma.Decimal(APP_CONSTANTS.PLATFORM_FEE_RATE);
  const feeAmount = finalAmount.mul(platformFeeRate);
  const releaseAmount = finalAmount.sub(feeAmount);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Trừ tiền bị khóa của client
    await tx.wallet.update({
      where: { id: clientWallet.id },
      data: { lockedBalance: { decrement: contract.lockedAmount } },
    });

    // Nếu có phạt → hoàn trả phần phạt lại cho client
    if (contract.penaltyAmount && contract.penaltyAmount.greaterThan(0)) {
       await tx.wallet.update({
        where: { id: clientWallet.id },
        data: { availableBalance: { increment: contract.penaltyAmount } },
       });
       await tx.walletTransaction.create({
         data: {
           walletId: clientWallet.id,
           type: "REFUND",
           amount: contract.penaltyAmount,
           beforeBalance: clientWallet.availableBalance,
           afterBalance: clientWallet.availableBalance.add(contract.penaltyAmount),
           description: `Hoàn tiền phạt trễ hạn hợp đồng #${id.slice(0, 8)}`,
         }
       })
    }

    // 2. Cộng tiền cho freelancer
    const holdUntil = addDays(new Date(), APP_CONSTANTS.ESCROW_HOLD_DAYS);
    const updatedFreelancerWallet = await tx.wallet.update({
      where: { id: freelancerWallet.id },
      data: {
        availableBalance: { increment: releaseAmount },
        holdUntil, // Giữ tiền X ngày
      },
    });

    // 3. Ghi log release
    await tx.walletTransaction.create({
      data: {
        walletId: freelancerWallet.id,
        type: "ESCROW_RELEASE",
        amount: releaseAmount,
        beforeBalance: freelancerWallet.availableBalance,
        afterBalance: updatedFreelancerWallet.availableBalance,
        referenceType: "CONTRACT",
        referenceId: id,
        description: `Giải ngân hợp đồng #${id.slice(0, 8)} (đã trừ ${APP_CONSTANTS.PLATFORM_FEE_RATE * 100}% phí)`,
      },
    });

    // 4. Ghi log phí sàn
    await tx.walletTransaction.create({
      data: {
        walletId: freelancerWallet.id,
        type: "PLATFORM_FEE",
        amount: feeAmount,
        beforeBalance: freelancerWallet.availableBalance, // fee doesn't affect user balance since we already recorded net increment
        afterBalance: freelancerWallet.availableBalance,
        referenceType: "CONTRACT",
        referenceId: id,
        description: `Phí sàn ${APP_CONSTANTS.PLATFORM_FEE_RATE * 100}% cho hợp đồng #${id.slice(0, 8)}`,
      },
    });

    // 5. Đóng job
    if (contract.jobId) {
      await tx.job.update({
        where: { id: contract.jobId },
        data: { status: "CLOSED" },
      });
    }

    // 6. Hoàn tất hợp đồng
    const updatedContract = await contractsRepo.updateContract(
      id,
      {
        status: "DONE",
        completedAt: new Date(),
      },
      tx
    );

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Hoàn thành hợp đồng",
        action: "CONTRACT_COMPLETED",
        description: "Hợp đồng đã được nghiệm thu và giải ngân",
      },
    });

    return updatedContract;
  });

  await prisma.notification.create({
    data: {
      userId: contract.freelancerId,
      type: "CONTRACT_DONE",
      title: "Hợp đồng đã hoàn tất!",
      body: `Khách hàng đã nghiệm thu. Số tiền ${releaseAmount.toNumber().toLocaleString("vi-VN")} VNĐ đã được cộng vào ví của bạn.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

// ── 5. Extension (Gia hạn) ──────────────────────────────────

export const requestExtension = async (id: string, userId: string, dto: any) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isFreelancer } = verifyContractParticipant(contract, userId);
  if (!isFreelancer) throw new ForbiddenError("Chỉ freelancer mới có thể xin gia hạn");

  if (contract.status !== "IN_PROGRESS" && contract.status !== "REVISION_REQUESTED") {
    throw new BusinessRuleError("Hợp đồng không ở trạng thái cho phép gia hạn");
  }

  const existingRequest = await prisma.extensionRequest.findFirst({
    where: { contractId: id, status: "PENDING" },
  });

  if (existingRequest) {
    throw new BusinessRuleError("Bạn đã gửi một yêu cầu gia hạn và đang chờ duyệt", ERROR_CODES.EXTENSION_ALREADY_EXISTS);
  }

  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.extensionRequest.create({
      data: {
        contractId: id,
        requestedById: userId,
        requestedDays: dto.requestedDays,
        reason: dto.reason,
        newDeadline: new Date(contract.deadlineAt.getTime() + dto.requestedDays * 24 * 60 * 60 * 1000),
      },
    });

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Yêu cầu gia hạn",
        action: "EXTENSION_REQUESTED",
        description: `Xin gia hạn thêm ${dto.requestedDays} ngày. Lý do: ${dto.reason}`,
      },
    });

    return request;
  });

  await prisma.notification.create({
    data: {
      userId: contract.clientId,
      type: "EXTENSION_REQUESTED",
      title: "Yêu cầu gia hạn hợp đồng",
      body: `Freelancer xin gia hạn hợp đồng thêm ${dto.requestedDays} ngày. Lý do: ${dto.reason}`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

export const approveExtension = async (id: string, userId: string) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isClient } = verifyContractParticipant(contract, userId);
  if (!isClient) throw new ForbiddenError("Chỉ khách hàng mới có quyền duyệt gia hạn");

  const request = await prisma.extensionRequest.findFirst({
    where: { contractId: id, status: "PENDING" },
  });

  if (!request) {
    throw new NotFoundError("Không có yêu cầu gia hạn nào đang chờ duyệt", ERROR_CODES.EXTENSION_NOT_FOUND);
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.extensionRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED", respondedAt: new Date() },
    });

    const newDeadline = addDays(contract.deadlineAt, request.requestedDays);
    await tx.contract.update({
      where: { id },
      data: { deadlineAt: newDeadline },
    });

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Duyệt gia hạn",
        action: "EXTENSION_APPROVED",
        description: `Đã chấp thuận gia hạn thêm ${request.requestedDays} ngày. Deadline mới: ${newDeadline.toLocaleDateString("vi-VN")}`,
      },
    });

    return { request, newDeadline };
  });

  await prisma.notification.create({
    data: {
      userId: contract.freelancerId,
      type: "EXTENSION_APPROVED",
      title: "Yêu cầu gia hạn được chấp thuận",
      body: `Khách hàng đã đồng ý gia hạn thêm ${request.requestedDays} ngày.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

export const rejectExtension = async (id: string, userId: string) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isClient } = verifyContractParticipant(contract, userId);
  if (!isClient) throw new ForbiddenError("Chỉ khách hàng mới có quyền từ chối gia hạn");

  const request = await prisma.extensionRequest.findFirst({
    where: { contractId: id, status: "PENDING" },
  });

  if (!request) {
    throw new NotFoundError("Không có yêu cầu gia hạn nào đang chờ duyệt");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.extensionRequest.update({
      where: { id: request.id },
      data: { status: "REJECTED", respondedAt: new Date() },
    });

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Từ chối gia hạn",
        action: "EXTENSION_REJECTED",
        description: `Đã từ chối yêu cầu gia hạn ${request.daysRequested} ngày`,
      },
    });

    return request;
  });

  await prisma.notification.create({
    data: {
      userId: contract.freelancerId,
      type: "EXTENSION_REJECTED",
      title: "Yêu cầu gia hạn bị từ chối",
      body: `Khách hàng đã từ chối yêu cầu gia hạn của bạn. Vui lòng hoàn thành đúng tiến độ.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

// ── 6. Mutual Cancel (Hủy êm thấm) ──────────────────────────

export const requestMutualCancel = async (id: string, userId: string, dto: any) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  verifyContractParticipant(contract, userId);

  if (contract.status === "DONE" || contract.status === "CANCELED" || contract.status === "DISPUTED") {
    throw new BusinessRuleError("Hợp đồng ở trạng thái này không thể yêu cầu hủy");
  }

  const existing = await prisma.mutualCancelRequest.findFirst({
    where: { contractId: id, status: "PENDING" },
  });

  if (existing) {
    throw new BusinessRuleError("Đã có một yêu cầu hủy đang chờ phản hồi", ERROR_CODES.MUTUAL_CANCEL_ALREADY_EXISTS);
  }

  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.mutualCancelRequest.create({
      data: {
        contractId: id,
        requestedById: userId,
        reason: dto.reason,
      },
    });

    await tx.timeline.create({
      data: {
        contractId: id,
        createdById: userId,
        title: "Yêu cầu hủy hợp đồng",
        action: "MUTUAL_CANCEL_REQUESTED",
        description: `Yêu cầu hủy hợp đồng êm thấm. Lý do: ${dto.reason}`,
      },
    });

    return request;
  });

  const targetUserId = contract.clientId === userId ? contract.freelancerId : contract.clientId;
  await prisma.notification.create({
    data: {
      userId: targetUserId,
      type: "MUTUAL_CANCEL_REQUESTED",
      title: "Yêu cầu hủy hợp đồng",
      body: `Đối tác đã gửi yêu cầu hủy hợp đồng êm thấm. Nếu bạn đồng ý, tiền sẽ được hoàn trả cho khách hàng 100%.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

export const approveMutualCancel = async (id: string, userId: string) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  verifyContractParticipant(contract, userId);

  const request = await prisma.mutualCancelRequest.findFirst({
    where: { contractId: id, status: "PENDING" },
  });

  if (!request) {
    throw new NotFoundError("Không có yêu cầu hủy nào đang chờ duyệt", ERROR_CODES.MUTUAL_CANCEL_NOT_FOUND);
  }

  if (request.requestedById === userId) {
    throw new BusinessRuleError("Bạn không thể tự duyệt yêu cầu của mình");
  }

  const clientWallet = await prisma.wallet.findUnique({ where: { userId: contract.clientId } });
  if (!clientWallet) throw new NotFoundError("Lỗi hệ thống: Không tìm thấy ví khách hàng");

  const result = await prisma.$transaction(async (tx) => {
    await tx.mutualCancelRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED", respondedAt: new Date() },
    });

    const updatedClientWallet = await tx.wallet.update({
      where: { id: clientWallet.id },
      data: {
        lockedBalance: { decrement: contract.lockedAmount },
        availableBalance: { increment: contract.lockedAmount },
      },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: clientWallet.id,
        type: "REFUND",
        amount: contract.lockedAmount,
        beforeBalance: clientWallet.availableBalance,
        afterBalance: updatedClientWallet.availableBalance,
        referenceType: "CONTRACT",
        referenceId: id,
        description: `Hoàn tiền do hủy hợp đồng êm thấm #${id.slice(0, 8)}`,
      },
    });

    await tx.contract.update({
      where: { id },
      data: { status: "CANCELED", completedAt: new Date() },
    });
    
    if (contract.jobId) {
      await tx.job.update({
        where: { id: contract.jobId },
        data: { status: "OPEN", bidCount: { decrement: 1 } },
      });
    }

    await tx.timeline.create({
      data: {
        contractId: id,
        userId,
        action: "MUTUAL_CANCEL_APPROVED",
        description: "Đã đồng ý hủy hợp đồng. Tiền đã được hoàn lại cho khách hàng.",
      },
    });

    return request;
  });

  await prisma.notification.create({
    data: {
      userId: request.requestedById,
      type: "MUTUAL_CANCEL_APPROVED",
      title: "Hợp đồng đã được hủy êm thấm",
      body: `Đối tác đã đồng ý hủy hợp đồng. Tiền đã được hoàn lại cho khách hàng.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

export const rejectMutualCancel = async (id: string, userId: string) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  verifyContractParticipant(contract, userId);

  const request = await prisma.mutualCancelRequest.findFirst({
    where: { contractId: id, status: "PENDING" },
  });

  if (!request) {
    throw new NotFoundError("Không có yêu cầu hủy nào đang chờ duyệt");
  }

  if (request.requestedById === userId) {
    throw new BusinessRuleError("Bạn không thể tự từ chối yêu cầu của mình");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.mutualCancelRequest.update({
      where: { id: request.id },
      data: { status: "REJECTED", respondedAt: new Date() },
    });

    await tx.timeline.create({
      data: {
        contractId: id,
        userId,
        action: "MUTUAL_CANCEL_REJECTED",
        description: "Từ chối yêu cầu hủy hợp đồng êm thấm",
      },
    });

    return request;
  });

  await prisma.notification.create({
    data: {
      userId: request.requestedById,
      type: "MUTUAL_CANCEL_REJECTED",
      title: "Yêu cầu hủy hợp đồng bị từ chối",
      body: `Đối tác đã từ chối yêu cầu hủy hợp đồng. Hợp đồng vẫn tiếp tục như bình thường.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};

// ── 7. MIA & Force Cancel ───────────────────────────────────

export const pingFreelancer = async (id: string, userId: string) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isClient } = verifyContractParticipant(contract, userId);
  if (!isClient) throw new ForbiddenError("Chỉ khách hàng mới có thể gọi freelancer (Ping)");

  if (contract.status !== "IN_PROGRESS" && contract.status !== "REVISION_REQUESTED") {
    throw new BusinessRuleError("Trạng thái hợp đồng không cho phép thực hiện thao tác này");
  }

  const dbContract = await prisma.contract.findUnique({ where: { id } });
  if (!dbContract?.miaWarned) {
    throw new BusinessRuleError(
      `Bạn chỉ có thể dùng tính năng này khi freelancer không hoạt động quá ${APP_CONSTANTS.MIA_THRESHOLD_HOURS} giờ`,
      ERROR_CODES.PING_NOT_ALLOWED
    );
  }

  await prisma.contract.update({
    where: { id },
    data: { lastPingedAt: new Date() },
  });

  await prisma.timeline.create({
    data: {
      contractId: id,
      userId,
      action: "FREELANCER_PINGED",
      description: "Khách hàng đã gọi cảnh báo MIA",
    },
  });

  await prisma.notification.create({
    data: {
      userId: contract.freelancerId,
      type: "MIA_WARNING",
      title: "CẢNH BÁO: Khách hàng đang tìm bạn!",
      body: `Khách hàng đang gọi bạn. Nếu bạn không phản hồi trong 24h, khách hàng có quyền đơn phương hủy hợp đồng và nhận lại 100% tiền.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return { success: true };
};

export const forceCancel = async (id: string, userId: string) => {
  const contract = await contractsRepo.findContractById(id);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  const { isClient } = verifyContractParticipant(contract, userId);
  if (!isClient) throw new ForbiddenError("Chỉ khách hàng mới có thể hủy đơn phương");

  const dbContract = await prisma.contract.findUnique({ where: { id } });
  if (!dbContract?.lastPingedAt) {
    throw new BusinessRuleError("Bạn phải dùng tính năng Ping trước khi hủy đơn phương");
  }

  const hoursSincePing = (new Date().getTime() - dbContract.lastPingedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSincePing < 24) {
    throw new BusinessRuleError(
      `Vui lòng đợi thêm ${Math.ceil(24 - hoursSincePing)} giờ nữa trước khi hủy đơn phương`,
      ERROR_CODES.FORCE_CANCEL_TOO_EARLY
    );
  }

  const clientWallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!clientWallet) throw new NotFoundError("Không tìm thấy ví");

  const result = await prisma.$transaction(async (tx) => {
    const updatedClientWallet = await tx.wallet.update({
      where: { id: clientWallet.id },
      data: {
        lockedBalance: { decrement: contract.lockedAmount },
        availableBalance: { increment: contract.lockedAmount },
      },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: clientWallet.id,
        type: "REFUND",
        amount: contract.lockedAmount,
        beforeBalance: clientWallet.availableBalance,
        afterBalance: updatedClientWallet.availableBalance,
        referenceType: "CONTRACT",
        referenceId: id,
        description: `Hoàn tiền do hủy hợp đồng đơn phương (MIA) #${id.slice(0, 8)}`,
      },
    });

    await tx.contract.update({
      where: { id },
      data: { status: "CANCELED", completedAt: new Date() },
    });

    if (contract.jobId) {
      await tx.job.update({
        where: { id: contract.jobId },
        data: { status: "OPEN", bidCount: { decrement: 1 } },
      });
    }

    const freelancer = await tx.user.findUnique({ where: { id: contract.freelancerId } });
    if (freelancer && freelancer.ratingAvg > 0) {
       await tx.user.update({
         where: { id: contract.freelancerId },
         data: { ratingAvg: Math.max(0, freelancer.ratingAvg - 0.5) }
       })
    }

    await tx.timeline.create({
      data: {
        contractId: id,
        userId,
        action: "CONTRACT_FORCE_CANCELED",
        description: "Hủy hợp đồng đơn phương do freelancer không phản hồi. Khách hàng đã được hoàn 100% tiền.",
      },
    });

    return dbContract;
  });

  await prisma.notification.create({
    data: {
      userId: contract.freelancerId,
      type: "CONTRACT_FORCE_CANCELED",
      title: "Hợp đồng đã bị hủy đơn phương",
      body: `Khách hàng đã hủy hợp đồng do bạn không phản hồi sau 24h cảnh báo. Tiền đã được hoàn lại cho khách hàng.`,
      referenceType: "CONTRACT",
      referenceId: id,
    },
  });

  return result;
};
