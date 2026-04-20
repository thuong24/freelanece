export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  bio: string | null;
  skills: string | null; // JSON array string
  ratingAvg: number;
  ratingCount: number;
  freePostQuota: number;
  freeBidQuota: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  skills: string[];
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  _count?: {
    postedJobs: number;
    freelancerContracts: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}
