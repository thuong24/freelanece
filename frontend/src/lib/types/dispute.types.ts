export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";

export interface Dispute {
  id: string;
  contractId: string;
  creatorId: string;
  status: DisputeStatus;
  reason: string;
  evidenceUrl: string | null;
  resolutionInfo: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; name: string; role: string };
  contract?: {
    id: string;
    status: string;
    lockedAmount: string;
    client: { id: string; name: string };
    freelancer: { id: string; name: string };
  };
}
