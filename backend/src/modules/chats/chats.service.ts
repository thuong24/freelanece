import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError, ForbiddenError, BusinessRuleError } from "../../common/errors/http-errors";
import { containsRestrictedKeywords } from "../../common/utils/regex";
import { getPaginationParams, buildPaginationMeta } from "../../common/pagination/pagination";
import * as contractsRepo from "../contracts/contracts.repository";
import type { SendMessageDto, GetMessagesQueryDto } from "./chats.dto";

export const sendMessage = async (userId: string, dto: SendMessageDto) => {
  const contract = await contractsRepo.findContractById(dto.contractId);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new ForbiddenError("Bạn không có quyền chat trong hợp đồng này");
  }

  // Kiểm tra anti-bypass
  const isCensored = containsRestrictedKeywords(dto.content);
  
  const result = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        contractId: dto.contractId,
        senderId: userId,
        content: dto.content,
        isCensored,
      },
    });

    if (isCensored) {
      // Tăng bộ đếm cảnh báo của user
      const user = await tx.user.update({
        where: { id: userId },
        data: { bypassWarningCount: { increment: 1 } },
      });

      // Nếu cảnh báo >= 3 lần, tự động khóa tính năng chat
      if (user.bypassWarningCount >= 3) {
        const lockedUntil = new Date();
        lockedUntil.setDate(lockedUntil.getDate() + 3); // Khóa 3 ngày

        await tx.featureLock.create({
          data: {
            userId,
            feature: "CHAT",
            lockedUntil,
            reason: "Vi phạm quy định chống giao dịch ngoài nền tảng 3 lần liên tiếp.",
          },
        });

        await tx.notification.create({
          data: {
            userId,
            type: "SYSTEM_ALERT",
            title: "Tài khoản bị khóa tính năng nhắn tin",
            body: "Bạn đã vi phạm quy định chống giao dịch ngoài nền tảng quá 3 lần. Tính năng nhắn tin bị khóa trong 3 ngày.",
          },
        });
      }
    }

    return message;
  });

  const receiverId = contract.clientId === userId ? contract.freelancerId : contract.clientId;
  
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "NEW_MESSAGE",
      title: "Tin nhắn mới",
      body: `Bạn có tin nhắn mới từ hợp đồng #${dto.contractId.slice(0, 8)}`,
      referenceType: "MESSAGE",
      referenceId: result.id,
    },
  });

  return result;
};

export const getMessages = async (contractId: string, userId: string, query: GetMessagesQueryDto) => {
  const contract = await contractsRepo.findContractById(contractId);
  if (!contract) throw new NotFoundError("Không tìm thấy hợp đồng");

  if (contract.clientId !== userId && contract.freelancerId !== userId) {
    throw new ForbiddenError("Bạn không có quyền xem tin nhắn hợp đồng này");
  }

  const params = getPaginationParams(query);

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { contractId },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.limit,
    }),
    prisma.message.count({ where: { contractId } }),
  ]);

  // Censor nội dung và đảo ngược để tin nhắn mới ở dưới
  const sanitized = messages.reverse().map(msg => ({
    ...msg,
    content: msg.isCensored ? "***Nội dung bị ẩn do chứa thông tin liên hệ***" : msg.content,
  }));

  return { messages: sanitized, meta: buildPaginationMeta(total, params) };
};
