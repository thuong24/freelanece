import cron from "node-cron";
import { prisma } from "../config/prisma";
import { logger } from "../common/utils/logger";
import { APP_CONSTANTS } from "../common/constants/app.constants";
import * as contractsService from "../modules/contracts/contracts.service";

export const initCronJobs = () => {
  logger.info("🕒 Đang khởi tạo các tác vụ nền (Cronjobs)...");

  // 1. Quét hợp đồng quá deadline (Mỗi giờ)
  cron.schedule("0 * * * *", async () => {
    try {
      const lateContracts = await prisma.contract.findMany({
        where: {
          status: "IN_PROGRESS",
          deadlineAt: { lt: new Date() },
        },
      });

      for (const contract of lateContracts) {
        // Áp dụng phạt (VD: 5% tổng giá trị mỗi ngày trễ)
        const penaltyRate = new (await import("@prisma/client")).Prisma.Decimal(APP_CONSTANTS.LATE_PENALTY_RATE);
        const penaltyAmount = contract.lockedAmount.mul(penaltyRate);
        
        await prisma.contract.update({
          where: { id: contract.id },
          data: { penaltyAmount },
        });

        await prisma.notification.create({
          data: {
            userId: contract.freelancerId,
            type: "SYSTEM_ALERT",
            title: "CẢNH BÁO: Quá hạn hợp đồng",
            body: `Hợp đồng #${contract.id.slice(0, 8)} đã quá hạn. Bạn sẽ bị trừ 5% phí phạt trễ hạn.`,
            referenceType: "CONTRACT",
            referenceId: contract.id,
          },
        });
      }

      if (lateContracts.length > 0) {
        logger.info(`Đã quét và áp dụng phạt cho ${lateContracts.length} hợp đồng trễ hạn`);
      }
    } catch (error) {
      logger.error("Lỗi khi chạy cron quét hợp đồng trễ hạn:", error);
    }
  });

  // 2. Auto-release (Tự động giải ngân nếu khách hàng không phản hồi sau X giờ)
  // Quét mỗi giờ
  cron.schedule("0 * * * *", async () => {
    try {
      // Lấy danh sách hợp đồng WAITING_FOR_REVIEW
      const pendingContracts = await prisma.contract.findMany({
        where: {
          status: "WAITING_FOR_REVIEW",
          submittedAt: { not: null },
        },
      });

      let count = 0;
      for (const contract of pendingContracts) {
        if (!contract.submittedAt) continue;

        const hoursSinceSubmit = (new Date().getTime() - contract.submittedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceSubmit >= APP_CONSTANTS.AUTO_RELEASE_HOURS) {
          // Tự động giải ngân (gọi logic acceptContract với tư cách là hệ thống/khách hàng)
          await contractsService.acceptContract(contract.id, contract.clientId);
          count++;

          await prisma.timeline.create({
            data: {
              contractId: contract.id,
              userId: contract.clientId,
              action: "AUTO_RELEASED",
              description: `Khách hàng không phản hồi sau ${APP_CONSTANTS.AUTO_RELEASE_HOURS}h. Hệ thống tự động nghiệm thu và giải ngân.`,
            },
          });
        }
      }

      if (count > 0) {
        logger.info(`Đã tự động giải ngân cho ${count} hợp đồng`);
      }
    } catch (error) {
      logger.error("Lỗi khi chạy cron auto-release:", error);
    }
  });

  // 3. MIA Tracker (Cảnh báo Freelancer không phản hồi)
  // Quét 4 lần 1 ngày
  cron.schedule("0 */6 * * *", async () => {
    try {
      const thresholdHours = APP_CONSTANTS.MIA_THRESHOLD_HOURS;
      const thresholdDate = new Date();
      thresholdDate.setHours(thresholdDate.getHours() - thresholdHours);

      const miaContracts = await prisma.contract.findMany({
        where: {
          status: { in: ["IN_PROGRESS", "REVISION_REQUESTED"] },
          lastFreelancerActivityAt: { lt: thresholdDate },
          miaWarned: false,
        },
      });

      for (const contract of miaContracts) {
        await prisma.contract.update({
          where: { id: contract.id },
          data: { miaWarned: true },
        });

        await prisma.notification.create({
          data: {
            userId: contract.clientId,
            type: "SYSTEM_ALERT",
            title: "Phát hiện Freelancer không hoạt động",
            body: `Freelancer của hợp đồng #${contract.id.slice(0, 8)} đã không phản hồi quá ${thresholdHours}h. Bạn có thể sử dụng chức năng PING để gọi.`,
            referenceType: "CONTRACT",
            referenceId: contract.id,
          },
        });
      }

      if (miaContracts.length > 0) {
        logger.info(`Đã gắn cờ MIA cho ${miaContracts.length} hợp đồng`);
      }
    } catch (error) {
      logger.error("Lỗi khi chạy cron MIA tracker:", error);
    }
  });

  // 4. Reset Quota Hàng Tháng (Lúc 00:00 ngày 1 mỗi tháng)
  cron.schedule("0 0 1 * *", async () => {
    try {
      await prisma.user.updateMany({
        data: {
          freePostQuota: APP_CONSTANTS.FREE_POST_QUOTA_PER_MONTH,
          freeBidQuota: APP_CONSTANTS.FREE_BID_QUOTA_PER_MONTH,
        },
      });
      logger.info("Đã reset Quota đăng bài/đấu thầu hàng tháng cho toàn bộ user");
    } catch (error) {
      logger.error("Lỗi khi reset quota hàng tháng:", error);
    }
  });

  logger.info("✅ Cronjobs đã khởi chạy");
};
