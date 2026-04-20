import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../../common/errors/http-errors";
import { ERROR_CODES } from "../../common/constants/error-codes";
import { APP_CONSTANTS } from "../../common/constants/app.constants";
import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import * as jobsRepo from "./jobs.repository";
import type { CreateJobDto, UpdateJobDto, GetJobsQueryDto } from "./jobs.dto";

// Kiểm tra feature lock POST_JOB còn hiệu lực không
const checkPostJobLock = async (userId: string) => {
  const lock = await prisma.featureLock.findFirst({
    where: {
      userId,
      feature: "POST_JOB",
      lockedUntil: { gt: new Date() },
    },
  });

  if (lock) {
    const unlockTime = lock.lockedUntil.toLocaleString("vi-VN");
    throw new BusinessRuleError(
      `Tính năng đăng bài của bạn đang bị tạm khóa đến ${unlockTime} do vi phạm quy định`,
      ERROR_CODES.POST_FEATURE_LOCKED
    );
  }
};

// Tạo job mới
export const createJob = async (userId: string, dto: CreateJobDto) => {
  await checkPostJobLock(userId);

  // Lấy thông tin quota của user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { freePostQuota: true, wallet: { select: { availableBalance: true } } },
  });

  if (!user) throw new NotFoundError("Không tìm thấy tài khoản");

  let freeQuotaUsed = false;
  let bumpedAt: Date | undefined;

  // Xử lý đẩy top
  if (dto.isBumped) {
    const bumpFee = new Prisma.Decimal(APP_CONSTANTS.BUMP_FEE);
    if (!user.wallet || user.wallet.availableBalance.lessThan(bumpFee)) {
      throw new BusinessRuleError(
        `Số dư không đủ để đẩy top. Phí đẩy top: ${APP_CONSTANTS.BUMP_FEE.toLocaleString("vi-VN")} VNĐ`,
        ERROR_CODES.INSUFFICIENT_BALANCE
      );
    }
    bumpedAt = new Date();
  }

  const result = await prisma.$transaction(async (tx) => {
    let finalFreeQuotaUsed = freeQuotaUsed;

    // Trừ phí đăng bài (nếu hết quota)
    if (user.freePostQuota > 0) {
      finalFreeQuotaUsed = true;
      await tx.user.update({
        where: { id: userId },
        data: { freePostQuota: { decrement: 1 } },
      });
    }
    // Nếu hết quota miễn phí → hiện tại chưa tính phí đăng bài thêm (có thể mở rộng sau)

    // Trừ phí bump nếu có
    if (dto.isBumped) {
      const bumpFee = new Prisma.Decimal(APP_CONSTANTS.BUMP_FEE);
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundError("Không tìm thấy ví điện tử");

      await tx.wallet.update({
        where: { userId },
        data: { availableBalance: { decrement: bumpFee } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "PLATFORM_FEE",
          amount: bumpFee,
          beforeBalance: wallet.availableBalance,
          afterBalance: wallet.availableBalance.sub(bumpFee),
          referenceType: "JOB_BUMP",
          description: `Phí đẩy top bài đăng`,
        },
      });
    }

    const job = await tx.job.create({
      data: {
        clientId: userId,
        title: dto.title,
        description: dto.description,
        budget: new Prisma.Decimal(dto.budget),
        deadlineDays: dto.deadlineDays,
        codeQualityRequirement: dto.codeQualityRequirement,
        screeningQuestion: dto.screeningQuestion,
        isBumped: dto.isBumped ?? false,
        bumpedAt: bumpedAt,
        freeQuotaUsed: finalFreeQuotaUsed,
      },
    });

    return job;
  });

  return result;
};

// Lấy danh sách job (public)
export const getJobs = async (query: GetJobsQueryDto) => {
  const params = getPaginationParams(query);
  const [jobs, total] = await Promise.all([
    jobsRepo.findJobs(query),
    jobsRepo.countJobs(query),
  ]);
  return { jobs, meta: buildPaginationMeta(total, params) };
};

// Lấy job của mình
export const getMyJobs = async (userId: string, query: { page: number; limit: number }) => {
  const params = getPaginationParams(query);
  const [jobs, total] = await Promise.all([
    jobsRepo.findJobsByClientId(userId, params.skip, params.limit),
    jobsRepo.countJobsByClientId(userId),
  ]);
  return { jobs, meta: buildPaginationMeta(total, params) };
};

// Lấy chi tiết job
export const getJobById = async (id: string) => {
  const job = await jobsRepo.findJobById(id);
  if (!job) throw new NotFoundError("Không tìm thấy bài đăng này");
  return job;
};

// Cập nhật job — chỉ chủ bài và khi OPEN
export const updateJob = async (jobId: string, userId: string, dto: UpdateJobDto) => {
  const job = await jobsRepo.findJobById(jobId);
  if (!job) throw new NotFoundError("Không tìm thấy bài đăng này");
  if (job.clientId !== userId) throw new ForbiddenError("Bạn không có quyền chỉnh sửa bài đăng này");
  if (job.status !== "OPEN") {
    throw new BusinessRuleError("Chỉ có thể chỉnh sửa bài đăng đang ở trạng thái mở");
  }

  return jobsRepo.updateJob(jobId, {
    ...(dto.title && { title: dto.title }),
    ...(dto.description && { description: dto.description }),
    ...(dto.budget && { budget: new Prisma.Decimal(dto.budget) }),
    ...(dto.deadlineDays && { deadlineDays: dto.deadlineDays }),
    ...(dto.codeQualityRequirement && { codeQualityRequirement: dto.codeQualityRequirement }),
    ...(dto.screeningQuestion !== undefined && { screeningQuestion: dto.screeningQuestion }),
  });
};

// Xóa job — chỉ khi OPEN và chưa có bid
export const deleteJob = async (jobId: string, userId: string) => {
  const job = await jobsRepo.findJobById(jobId);
  if (!job) throw new NotFoundError("Không tìm thấy bài đăng này");
  if (job.clientId !== userId) throw new ForbiddenError("Bạn không có quyền xóa bài đăng này");
  if (job.status !== "OPEN") {
    throw new BusinessRuleError("Chỉ có thể xóa bài đăng đang ở trạng thái mở");
  }
  if (job.bidCount > 0) {
    throw new BusinessRuleError(
      "Không thể xóa bài đăng đã có người trả giá. Hãy đóng bài đăng thay vì xóa.",
      ERROR_CODES.JOB_HAS_BIDS
    );
  }
  await jobsRepo.deleteJob(jobId);
};

// Đẩy top bài đăng
export const bumpJob = async (jobId: string, userId: string) => {
  const job = await jobsRepo.findJobById(jobId);
  if (!job) throw new NotFoundError("Không tìm thấy bài đăng này");
  if (job.clientId !== userId) throw new ForbiddenError("Bạn không có quyền đẩy top bài đăng này");
  if (job.status !== "OPEN") {
    throw new BusinessRuleError("Chỉ có thể đẩy top bài đăng đang ở trạng thái mở");
  }

  const bumpFee = new Prisma.Decimal(APP_CONSTANTS.BUMP_FEE);
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new NotFoundError("Không tìm thấy ví điện tử");
  if (wallet.availableBalance.lessThan(bumpFee)) {
    throw new BusinessRuleError(
      `Số dư không đủ để đẩy top. Phí đẩy top: ${APP_CONSTANTS.BUMP_FEE.toLocaleString("vi-VN")} VNĐ`,
      ERROR_CODES.INSUFFICIENT_BALANCE
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { availableBalance: { decrement: bumpFee } },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "PLATFORM_FEE",
        amount: bumpFee,
        beforeBalance: wallet.availableBalance,
        afterBalance: updatedWallet.availableBalance,
        referenceType: "JOB_BUMP",
        referenceId: jobId,
        description: `Phí đẩy top bài đăng #${jobId.slice(0, 8)}`,
      },
    });

    const updatedJob = await tx.job.update({
      where: { id: jobId },
      data: { isBumped: true, bumpedAt: new Date() },
    });

    return { job: updatedJob, transaction };
  });

  return result;
};
