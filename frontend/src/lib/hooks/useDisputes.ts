"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";
import { disputesApi } from "@/lib/api/disputes.api";
import { Alert } from "@/lib/utils/alert";

export const useDisputes = (filters?: object) =>
  useQuery({
    queryKey: QUERY_KEYS.disputes(filters),
    queryFn: async () => {
      const res = await disputesApi.getDisputes(filters as any);
      return res.data;
    },
  });

export const useDispute = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.dispute(id),
    queryFn: async () => {
      const res = await disputesApi.getDispute(id);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateDispute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { contractId: string; reason: string; evidenceUrl?: string }) => {
      const confirmed = await Alert.disputeConfirm();
      if (!confirmed.isConfirmed) throw new Error("cancelled");
      return disputesApi.createDispute(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disputes"] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
      Alert.toast("Khiếu nại đã được gửi. Admin sẽ xem xét sớm.", "success");
    },
    onError: (err: any) => {
      if (err.message !== "cancelled") Alert.error(err?.response?.data?.message || "Gửi khiếu nại thất bại");
    },
  });
};

export const useResolveDispute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof disputesApi.resolveDispute>[1] }) =>
      disputesApi.resolveDispute(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dispute(vars.id) });
      qc.invalidateQueries({ queryKey: ["disputes"] });
      Alert.toast("Phân xử khiếu nại thành công. Tiền đã được chia.", "success");
    },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Phân xử thất bại"),
  });
};
