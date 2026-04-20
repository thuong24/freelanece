import { User } from "@prisma/client";

export type UserProfile = Omit<User, "passwordHash" | "googleId">;

export interface PublicUserProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  skills: string | null;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
}
