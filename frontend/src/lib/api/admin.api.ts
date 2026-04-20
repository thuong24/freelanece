import api from "./axios";
import type { AdminStats, AdminUser } from "@/lib/types/admin.types";
import type { Dispute } from "@/lib/types/dispute.types";
import type { ApiResponse, PaginationMeta } from "@/lib/types/api.types";

export const adminApi = {
  getStats: () =>
    api.get<ApiResponse<AdminStats>>("/admin/stats"),

  getUsers: (params?: { page?: number; limit?: number; search?: string; status?: string; role?: string }) =>
    api.get<ApiResponse<AdminUser[]> & { meta: PaginationMeta }>("/admin/users", { params }),

  updateUserStatus: (id: string, data: { status: "ACTIVE" | "SUSPENDED" | "BANNED"; reason?: string }) =>
    api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, data),

  lockUserFeature: (id: string, data: { feature: "POST_JOB" | "BID"; days: number; reason: string }) =>
    api.post<ApiResponse<unknown>>(`/admin/users/${id}/lock-feature`, data),

  getDisputes: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<Dispute[]> & { meta: PaginationMeta }>("/disputes", { params }),

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
