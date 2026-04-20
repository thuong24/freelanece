"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";
import { chatsApi } from "@/lib/api/chats.api";
import { Alert } from "@/lib/utils/alert";

export const useMessages = (contractId: string, page: number = 1) =>
  useQuery({
    queryKey: [...QUERY_KEYS.messages(contractId), page],
    queryFn: async () => {
      const res = await chatsApi.getMessages(contractId, { page });
      return res.data;
    },
    enabled: !!contractId,
    refetchInterval: 5000,
  });

export const useSendMessage = (contractId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => chatsApi.sendMessage({ contractId, content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.messages(contractId) }),
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Gửi tin nhắn thất bại"),
  });
};
