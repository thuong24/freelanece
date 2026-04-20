export type ContractStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "WAITING_DEMO_APPROVAL"
  | "WAITING_SOURCE_CODE"
  | "WAITING_FOR_REVIEW"
  | "REVISION_REQUESTED"
  | "DISPUTED"
  | "DONE"
  | "CANCELLED"
  | "EXPIRED";

export interface Contract {
  id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  bidId: string;
  status: ContractStatus;
  budget: string;
  lockedAmount: string;
  penaltyAmount: string;
  platformFeeRate: string;
  deadlineAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  completedAt: string | null;
  demoUrl: string | null;
  sourceCodeUrl: string | null;
  readmeConfirmed: boolean;
  lastFreelancerActivityAt: string | null;
  miaWarned: boolean;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; avatarUrl: string | null };
  freelancer?: { id: string; name: string; avatarUrl: string | null };
  job?: { id: string; title: string };
  extensionRequest?: ExtensionRequest | null;
  mutualCancel?: MutualCancelRequest | null;
}

export interface ExtensionRequest {
  id: string;
  contractId: string;
  requestedById: string;
  reason: string;
  requestedDays: number;
  newDeadline: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface MutualCancelRequest {
  id: string;
  contractId: string;
  requestedById: string;
  reason: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED";
}
