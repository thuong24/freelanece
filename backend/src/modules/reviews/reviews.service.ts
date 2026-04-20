import { prisma } from "../../config/prisma";
import { NotFoundError, ForbiddenError, BusinessRuleError, ConflictError } from "../../common/errors/http-errors";
import * as reviewsRepo from "./reviews.repository";
import * as contractsRepo from "../contracts/contracts.repository";
import type { CreateReviewDto } from "./reviews.dto";

export const createReview = async (userId: string, dto: CreateReviewDto) => {
  const contract = await contractsRepo.findContractById(dto.contractId);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  if (contract.status !== "DONE") {
    throw new BusinessRuleError("Bạn chỉ có thể đánh giá khi hợp đồng đã hoàn tất");
  }

  let revieweeId: string;
  if (contract.clientId === userId) {
    revieweeId = contract.freelancerId;
  } else if (contract.freelancerId === userId) {
    revieweeId = contract.clientId;
  } else {
    throw new ForbiddenError("Bạn không có quyền đánh giá hợp đồng này");
  }

  const existingReview = await reviewsRepo.findReviewByContractAndReviewer(dto.contractId, userId);
  if (existingReview) {
    throw new ConflictError("Bạn đã đánh giá hợp đồng này rồi");
  }

  const overallScore = (dto.codeQualityScore + dto.communicationScore + dto.speedScore) / 3;

  const result = await prisma.$transaction(async (tx) => {
    const review = await reviewsRepo.createReview(
      {
        contract: { connect: { id: dto.contractId } },
        reviewer: { connect: { id: userId } },
        reviewee: { connect: { id: revieweeId } },
        codeQualityScore: dto.codeQualityScore,
        communicationScore: dto.communicationScore,
        speedScore: dto.speedScore,
        overallScore,
        comment: dto.comment || "",
      },
      tx
    );

    await reviewsRepo.updateAggregateUserRating(revieweeId, tx);
    return review;
  });

  const reviewer = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  
  await prisma.notification.create({
    data: {
      userId: revieweeId,
      type: "SYSTEM_ALERT",
      title: "Bạn có đánh giá mới",
      body: `${reviewer?.name} vừa đánh giá bạn ${overallScore.toFixed(1)} sao về hợp đồng #${dto.contractId.slice(0, 8)}.`,
      referenceType: "CONTRACT",
      referenceId: dto.contractId,
    },
  });

  return result;
};
