"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";
import { walletsApi } from "@/lib/api/wallets.api";
import { Alert } from "@/lib/utils/alert";

export const useWallet = () =>
  useQuery({
    queryKey: QUERY_KEYS.wallet,
    queryFn: async () => {
      const res = await walletsApi.getMyWallet();
      return res.data.data;
    },
  });

export const useTransactions = (filters?: object) =>
  useQuery({
    queryKey: QUERY_KEYS.transactions(filters),
    queryFn: async () => {
      const res = await walletsApi.getTransactions(filters as any);
      return res.data;
    },
  });

export const useDeposit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: walletsApi.deposit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.wallet });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      Alert.toast("Nạp tiền thành công", "success");
    },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Nạp tiền thất bại"),
  });
};

export const useWithdraw = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: walletsApi.withdraw,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.wallet });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      Alert.toast("Yêu cầu rút tiền đã được gửi", "success");
    },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Rút tiền thất bại"),
  });
};
