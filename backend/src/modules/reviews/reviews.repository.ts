import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

export const createReview = (data: Prisma.ReviewCreateInput, tx?: Prisma.TransactionClient) => {
  const db = tx || prisma;
  return db.review.create({ data });
};

export const findReviewByContractAndReviewer = (contractId: string, reviewerId: string) => {
  return prisma.review.findUnique({
    where: { contractId_reviewerId: { contractId, reviewerId } },
  });
};

export const updateAggregateUserRating = async (userId: string, tx: Prisma.TransactionClient) => {
  const stats = await tx.review.aggregate({
    where: { revieweeId: userId },
    _avg: { overallScore: true },
    _count: { overallScore: true },
  });

  const ratingAvg = stats._avg.overallScore || 0;
  const ratingCount = stats._count.overallScore || 0;

  await tx.user.update({
    where: { id: userId },
    data: { ratingAvg, ratingCount },
  });

  return { ratingAvg, ratingCount };
};
