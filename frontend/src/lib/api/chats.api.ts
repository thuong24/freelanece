import api from "./axios";
import type { ChatMessage } from "@/lib/types/chat.types";
import type { ApiResponse, PaginationMeta } from "@/lib/types/api.types";

export const chatsApi = {
  getMessages: (contractId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<ChatMessage[]> & { meta: PaginationMeta }>(`/chats/contracts/${contractId}`, { params }),

  sendMessage: (data: { contractId: string; content: string }) =>
    api.post<ApiResponse<ChatMessage>>("/chats", data),
};
