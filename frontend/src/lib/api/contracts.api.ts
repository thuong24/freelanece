import api from "./axios";
import type { Contract, ExtensionRequest, MutualCancelRequest } from "@/lib/types/contract.types";
import type { ApiResponse, PaginationMeta } from "@/lib/types/api.types";

export const contractsApi = {
  getContracts: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<Contract[]> & { meta: PaginationMeta }>("/contracts", { params }),

  getContract: (id: string) =>
    api.get<ApiResponse<Contract>>(`/contracts/${id}`),

  acceptBid: (bidId: string) =>
    api.post<ApiResponse<Contract>>("/contracts/accept-bid", { bidId }),

  // Delivery flow
  submitDemo: (id: string, data: { demoUrl: string }) =>
    api.post<ApiResponse<Contract>>(`/contracts/${id}/submit-demo`, data),

  approveDemo: (id: string) =>
    api.post<ApiResponse<Contract>>(`/contracts/${id}/approve-demo`),

  rejectDemo: (id: string, data: { reason: string }) =>
    api.post<ApiResponse<Contract>>(`/contracts/${id}/reject-demo`, data),

  submitFinal: (id: string, data: { sourceCodeUrl: string; readmeConfirmed: boolean }) =>
    api.post<ApiResponse<Contract>>(`/contracts/${id}/submit-final`, data),

  requestRevision: (id: string, data: { reason: string }) =>
    api.post<ApiResponse<Contract>>(`/contracts/${id}/revision`, data),

  acceptContract: (id: string) =>
    api.post<ApiResponse<Contract>>(`/contracts/${id}/accept`),

  // Extension
  requestExtension: (id: string, data: { reason: string; requestedDays: number }) =>
    api.post<ApiResponse<ExtensionRequest>>(`/contracts/${id}/extension-request`, data),

  approveExtension: (id: string) =>
    api.post<ApiResponse<ExtensionRequest>>(`/contracts/${id}/extension-request/approve`),

  rejectExtension: (id: string) =>
    api.post<ApiResponse<ExtensionRequest>>(`/contracts/${id}/extension-request/reject`),

  // Mutual cancel
  requestMutualCancel: (id: string, data: { reason: string }) =>
    api.post<ApiResponse<MutualCancelRequest>>(`/contracts/${id}/mutual-cancel/request`, data),

  approveMutualCancel: (id: string) =>
    api.post<ApiResponse<null>>(`/contracts/${id}/mutual-cancel/approve`),

  rejectMutualCancel: (id: string) =>
    api.post<ApiResponse<null>>(`/contracts/${id}/mutual-cancel/reject`),

  // MIA
  pingFreelancer: (id: string) =>
    api.post<ApiResponse<null>>(`/contracts/${id}/ping`),

  forceCancel: (id: string) =>
    api.post<ApiResponse<null>>(`/contracts/${id}/force-cancel`),
};
