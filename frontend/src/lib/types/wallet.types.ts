export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAW"
  | "ESCROW_LOCK"
  | "ESCROW_RELEASE"
  | "REFUND"
  | "LATE_PENALTY"
  | "PLATFORM_FEE"
  | "MILESTONE_RELEASE"
  | "BONUS";

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: string;
  lockedBalance: string;
  currency: string;
  holdUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: string;
  beforeBalance: string;
  afterBalance: string;
  referenceType: string | null;
  referenceId: string | null;
  description: string;
  createdAt: string;
}
