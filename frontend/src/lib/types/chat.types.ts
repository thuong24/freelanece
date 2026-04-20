export interface ChatMessage {
  id: string;
  contractId: string;
  senderId: string;
  content: string;
  isCensored: boolean;
  createdAt: string;
}

export interface Timeline {
  id: string;
  contractId: string;
  userId: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  amount: string;
  dueDate: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "DISPUTED";
  orderIndex: number;
  demoUrl: string | null;
  note: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
}

export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  codeQualityScore: number;
  communicationScore: number;
  speedScore: number;
  overallScore: number;
  comment: string;
  createdAt: string;
}
