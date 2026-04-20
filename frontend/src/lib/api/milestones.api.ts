import api from "./axios";
import type { Milestone } from "@/lib/types/chat.types";
import type { ApiResponse } from "@/lib/types/api.types";

export const milestonesApi = {
  createMilestones: (contractId: string, milestones: { title: string; amount: number; dueDate: string; orderIndex: number }[]) =>
    api.post<ApiResponse<Milestone[]>>("/milestones", { contractId, milestones }),

  submitMilestone: (id: string, data: { demoUrl?: string; note?: string }) =>
    api.post<ApiResponse<Milestone>>(`/milestones/${id}/submit`, data),

  approveMilestone: (id: string) =>
    api.post<ApiResponse<Milestone>>(`/milestones/${id}/approve`),
};
