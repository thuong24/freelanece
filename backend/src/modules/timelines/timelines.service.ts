import { prisma } from "../../config/prisma";
import { NotFoundError, ForbiddenError } from "../../common/errors/http-errors";
import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import * as contractsRepo from "../contracts/contracts.repository";
import type { CreateTimelineDto } from "./timelines.dto";

export const getTimelines = async (contractId: string, userId: string, query: { page: number; limit: number }) => {
  const contract = await contractsRepo.findContractById(contractId);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new ForbiddenError("Bạn không có quyền truy cập hợp đồng này");
  }

  const params = getPaginationParams(query);

  const [timelines, total] = await Promise.all([
    prisma.timeline.findMany({
      where: { contractId },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.limit,
    }),
    prisma.timeline.count({ where: { contractId } }),
  ]);

  return { timelines, meta: buildPaginationMeta(total, params) };
};

export const createTimeline = async (contractId: string, userId: string, dto: CreateTimelineDto) => {
  const contract = await contractsRepo.findContractById(contractId);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new ForbiddenError("Bạn không có quyền truy cập hợp đồng này");
  }

  const result = await prisma.$transaction(async (tx) => {
    const timeline = await tx.timeline.create({
      data: {
        contractId,
        createdById: userId,
        title: dto.title,
        description: dto.description,
        action: "MANUAL_UPDATE",
      },
    });

    // Reset lastFreelancerActivityAt nếu là freelancer
    if (contract.freelancerId === userId) {
      await tx.contract.update({
        where: { id: contractId },
        data: {
          lastFreelancerActivityAt: new Date(),
          miaWarned: false,
        },
      });
    }

    return timeline;
  });

  return result;
};
