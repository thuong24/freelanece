import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/utils/hash";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  const defaultPassword = await hashPassword("Password@123");

  // 1. Tạo Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@freelance.local" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@freelance.local",
      passwordHash: defaultPassword,
      role: "ADMIN",
      wallet: {
        create: {
          availableBalance: 0,
        },
      },
    },
  });

  // 2. Tạo Client
  const client = await prisma.user.upsert({
    where: { email: "client@freelance.local" },
    update: {},
    create: {
      name: "Công ty ABC",
      email: "client@freelance.local",
      passwordHash: defaultPassword,
      role: "USER",
      wallet: {
        create: {
          availableBalance: 50000000, // 50 củ
        },
      },
    },
  });

  // 3. Tạo Freelancer
  const freelancer = await prisma.user.upsert({
    where: { email: "dev@freelance.local" },
    update: {},
    create: {
      name: "Nguyễn Văn Dev",
      email: "dev@freelance.local",
      passwordHash: defaultPassword,
      role: "USER",
      skills: JSON.stringify(["React", "Node.js", "Prisma"]),
      wallet: {
        create: {
          availableBalance: 0,
        },
      },
    },
  });

  // 4. Tạo Job mẫu
  const job = await prisma.job.create({
    data: {
      clientId: client.id,
      title: "Cần code backend cho app bán hàng",
      description: "Cần tìm người viết API bằng Node.js Express. Thanh toán khi xong.",
      budget: 15000000,
      deadlineDays: 14,
      status: "OPEN",
    },
  });

  console.log("✅ Seeding finished.");
  console.log(`- Admin: ${admin.email} (Password@123)`);
  console.log(`- Client: ${client.email} (Password@123)`);
  console.log(`- Freelancer: ${freelancer.email} (Password@123)`);
  console.log(`- Sample Job: ${job.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
