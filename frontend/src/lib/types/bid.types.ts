export type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export interface Bid {
  id: string;
  jobId: string;
  bidderId: string;
  bidAmount: string;
  estimatedDays: number;
  message: string;
  screeningAnswer: string | null;
  status: BidStatus;
  usedFreeQuota: boolean;
  createdAt: string;
  updatedAt: string;
  bidder?: { id: string; name: string; ratingAvg: number; avatarUrl: string | null };
}

export interface CreateBidInput {
  jobId: string;
  bidAmount: number;
  estimatedDays: number;
  message: string;
  screeningAnswer?: string;
}
