import { prisma } from "../../config/prisma";

export const getHomeData = async () => {
  const [featuredJobs, topPosters, highestRated, mostActiveFreelancers] = await Promise.all([
    // Featured Jobs
    prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: [
        { isBumped: "desc" },
        { createdAt: "desc" }
      ],
      take: 6,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          }
        }
      }
    }),

    // Top Posters (Clients with most jobs posted)
    prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        ratingAvg: true,
        _count: {
          select: { postedJobs: true }
        }
      },
      orderBy: {
        postedJobs: { _count: "desc" }
      },
      take: 5
    }),

    // Highest Rated Users
    prisma.user.findMany({
      where: {
        role: "USER",
        ratingCount: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        ratingAvg: true,
        ratingCount: true,
      },
      orderBy: [
        { ratingAvg: "desc" },
        { ratingCount: "desc" }
      ],
      take: 5
    }),

    // Most Active Freelancers (Most completed contracts)
    prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        ratingAvg: true,
        _count: {
          select: {
            freelancerContracts: {
              where: { status: "DONE" }
            }
          }
        }
      },
      orderBy: {
        freelancerContracts: { _count: "desc" }
      },
      take: 5
    })
  ]);

  return {
    featuredJobs,
    topPosters,
    highestRated,
    mostActiveFreelancers
  };
};
