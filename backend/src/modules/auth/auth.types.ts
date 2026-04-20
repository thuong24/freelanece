import { User, RefreshToken, FeatureLock } from "@prisma/client";

export type UserType = User;
export type RefreshTokenType = RefreshToken;
export type FeatureLockType = FeatureLock;

export interface AuthPayload {
  userId: string;
  role: string;
}
