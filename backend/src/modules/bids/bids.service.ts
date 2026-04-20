import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
  ConflictError,
} from "../../common/errors/http-errors";
import { ERROR_CODES } from "../../common/constants/error-codes";
import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import * as bidsRepo from "./bids.repository";
import * as jobsRepo from "../jobs/jobs.repository";
import type { CreateBidDto, UpdateBidDto, GetBidsQueryDto } from "./bids.dto";

// Kiểm tra feature lock BID
const checkBidLock = async (userId: string) => {
  const lock = await prisma.featureLock.findFirst({
    where: {
      userId,
      feature: "BID",
      lockedUntil: { gt: new Date() },
    },
  });

  if (lock) {
    const unlockTime = lock.lockedUntil.toLocaleString("vi-VN");
    throw new BusinessRuleError(
      `Tính năng đặt giá thầu của bạn đang bị tạm khóa đến ${unlockTime} do vi phạm quy định`,
      ERROR_CODES.BID_FEATURE_LOCKED
    );
  }
};

// Tạo bid mới
export const createBid = async (jobId: string, userId: string, dto: CreateBidDto) => {
  await checkBidLock(userId);

  // Lấy job
  const job = await jobsRepo.findJobById(jobId);
  if (!job) throw new NotFoundError("Không tìm thấy bài đăng này");
  if (job.status !== "OPEN") {
    throw new BusinessRuleError("Bài đăng này đã đóng, không thể đặt giá thầu", ERROR_CODES.JOB_CLOSED);
  }

  // Không được tự bid job mình
  if (job.clientId === userId) {
    throw new BusinessRuleError("Bạn không thể đặt giá thầu cho bài đăng của chính mình", ERROR_CODES.BID_SELF_NOT_ALLOWED);
  }

  // Kiểm tra đã bid chưa
  const existingBid = await bidsRepo.findExistingBid(jobId, userId);
  if (existingBid) {
    throw new ConflictError("Bạn đã đặt giá thầu cho bài đăng này rồi");
  }

  // Kiểm tra câu hỏi sàng lọc
  if (job.screeningQuestion && !dto.screeningAnswer?.trim()) {
    throw new BusinessRuleError(
      "Vui lòng trả lời câu hỏi sàng lọc của khách hàng trước khi đặt giá thầu"
    );
  }

  // Kiểm tra và xử lý quota
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { freeBidQuota: true },
  });
  if (!user) throw new NotFoundError("Không tìm thấy tài khoản");

  const usedFreeQuota = user.freeBidQuota > 0;

  const bid = await prisma.$transaction(async (tx) => {
    // Giảm quota nếu còn
    if (usedFreeQuota) {
      await tx.user.update({
        where: { id: userId },
        data: { freeBidQuota: { decrement: 1 } },
      });
    }
    // TODO: nếu hết quota miễn phí → trừ coin (mở rộng sau)

    const newBid = await tx.bid.create({
      data: {
        jobId,
        bidderId: userId,
        bidAmount: new Prisma.Decimal(dto.bidAmount),
        estimatedDays: dto.estimatedDays,
        message: dto.message,
        screeningAnswer: dto.screeningAnswer,
        usedFreeQuota,
      },
    });

    // Tăng bidCount của job
    await tx.job.update({
      where: { id: jobId },
      data: { bidCount: { increment: 1 } },
    });

    return newBid;
  });

  // Gửi notification cho chủ job
  await prisma.notification.create({
    data: {
      userId: job.clientId,
      type: "NEW_BID",
      title: "Có người đặt giá thầu mới",
      body: `Bài đăng "${job.title}" vừa nhận được một giá thầu mới`,
      referenceType: "BID",
      referenceId: bid.id,
    },
  });

  return bid;
};

// Lấy danh sách bid của job
export const getJobBids = async (jobId: string, userId: string, query: GetBidsQueryDto) => {
  const job = await jobsRepo.findJobById(jobId);
  if (!job) throw new NotFoundError("Không tìm thấy bài đăng này");

  // Chỉ chủ job mới xem được đầy đủ thông tin
  const isOwner = job.clientId === userId;
  const params = getPaginationParams(query);

  const [bids, total] = await Promise.all([
    bidsRepo.findBidsByJobId(jobId, query),
    bidsRepo.countBidsByJobId(jobId, query),
  ]);

  // Nếu không phải chủ job → ẩn screeningAnswer
  const sanitized = isOwner
    ? bids
    : bids.map(({ screeningAnswer: _sa, ...rest }) => rest);

  return { bids: sanitized, meta: buildPaginationMeta(total, params) };
};

// Lấy bid của mình
export const getMyBids = async (userId: string, query: { page: number; limit: number }) => {
  const params = getPaginationParams(query);
  const [bids, total] = await Promise.all([
    bidsRepo.findBidsByBidderId(userId, params.skip, params.limit),
    bidsRepo.countBidsByBidderId(userId),
  ]);
  return { bids, meta: buildPaginationMeta(total, params) };
};

// Lấy chi tiết bid
export const getBidById = async (bidId: string, userId: string) => {
  const bid = await bidsRepo.findBidById(bidId);
  if (!bid) throw new NotFoundError("Không tìm thấy giá thầu này");

  // Chỉ bidder hoặc chủ job mới xem được
  const isOwner = bid.job?.clientId === userId;
  const isBidder = bid.bidderId === userId;
  if (!isOwner && !isBidder) {
    throw new ForbiddenError("Bạn không có quyền xem giá thầu này");
  }

  return bid;
};

// Cập nhật bid — chỉ bidder, chỉ khi PENDING
export const updateBid = async (bidId: string, userId: string, dto: UpdateBidDto) => {
  const bid = await bidsRepo.findBidById(bidId);
  if (!bid) throw new NotFoundError("Không tìm thấy giá thầu này");
  if (bid.bidderId !== userId) throw new ForbiddenError("Bạn không có quyền chỉnh sửa giá thầu này");
  if (bid.status !== "PENDING") {
    throw new BusinessRuleError("Chỉ có thể chỉnh sửa giá thầu đang ở trạng thái chờ duyệt", ERROR_CODES.BID_NOT_PENDING);
  }

  return bidsRepo.updateBid(bidId, {
    ...(dto.bidAmount && { bidAmount: new Prisma.Decimal(dto.bidAmount) }),
    ...(dto.estimatedDays && { estimatedDays: dto.estimatedDays }),
    ...(dto.message && { message: dto.message }),
    ...(dto.screeningAnswer !== undefined && { screeningAnswer: dto.screeningAnswer }),
  });
};

// Rút bid (WITHDRAWN)
export const withdrawBid = async (bidId: string, userId: string) => {
  const bid = await bidsRepo.findBidById(bidId);
  if (!bid) throw new NotFoundError("Không tìm thấy giá thầu này");
  if (bid.bidderId !== userId) throw new ForbiddenError("Bạn không có quyền rút giá thầu này");
  if (bid.status !== "PENDING") {
    throw new BusinessRuleError("Chỉ có thể rút giá thầu đang ở trạng thái chờ duyệt");
  }

  return bidsRepo.updateBid(bidId, { status: "WITHDRAWN" });
};
