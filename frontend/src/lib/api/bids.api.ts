import api from "./axios";
import type { Bid, CreateBidInput } from "@/lib/types/bid.types";
import type { ApiResponse, PaginationMeta } from "@/lib/types/api.types";

export const bidsApi = {
  getJobBids: (jobId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Bid[]> & { meta: PaginationMeta }>(`/jobs/${jobId}/bids`, { params }),

  getBid: (id: string) =>
    api.get<ApiResponse<Bid>>(`/bids/${id}`),

  createBid: (data: CreateBidInput) =>
    api.post<ApiResponse<Bid>>(`/jobs/${data.jobId}/bids`, data),

  updateBid: (id: string, data: Partial<CreateBidInput>) =>
    api.patch<ApiResponse<Bid>>(`/bids/${id}`, data),

  withdrawBid: (id: string) =>
    api.delete<ApiResponse<null>>(`/bids/${id}`),
};
