import api from "./axios";
import type { Dispute } from "@/lib/types/dispute.types";
import type { ApiResponse, PaginationMeta } from "@/lib/types/api.types";

export const disputesApi = {
  getDisputes: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<Dispute[]> & { meta: PaginationMeta }>("/disputes", { params }),

  getDispute: (id: string) =>
    api.get<ApiResponse<Dispute>>(`/disputes/${id}`),

  createDispute: (data: { contractId: string; reason: string; evidenceUrl?: string }) =>
    api.post<ApiResponse<Dispute>>("/disputes", data),

  resolveDispute: (id: string, data: {
    resolutionInfo: string;
    refundPercentage: number;
    applyPenalty?: boolean;
    punishedUserId?: string;
    banUser?: boolean;
    lockFeature?: "POST_JOB" | "BID";
    lockDays?: number;
  }) =>
    api.post<ApiResponse<Dispute>>(`/disputes/${id}/resolve`, data),
};
