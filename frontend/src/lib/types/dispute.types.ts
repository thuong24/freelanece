export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";

export interface Dispute {
  id: string;
  contractId: string;
  openedById: string;
  status: DisputeStatus;
  reason: string;
  attachmentsJson: string | null;
  adminDecision: string | null;
  createdAt: string;
  updatedAt: string;
  openedBy?: { id: string; name: string; role: string };
  contract?: {
    id: string;
    status: string;
    lockedAmount: string;
    client: { id: string; name: string };
    freelancer: { id: string; name: string };
    job?: { title: string };
  };
}
