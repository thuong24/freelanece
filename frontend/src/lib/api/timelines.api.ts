import api from "./axios";
import type { Timeline } from "@/lib/types/chat.types";
import type { ApiResponse } from "@/lib/types/api.types";

export const timelinesApi = {
  getTimelines: (contractId: string) =>
    api.get<ApiResponse<Timeline[]>>(`/contracts/${contractId}/timelines`),

  createTimeline: (contractId: string, data: { action: string; description: string }) =>
    api.post<ApiResponse<Timeline>>(`/contracts/${contractId}/timelines`, data),
};
