"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";
import { bidsApi } from "@/lib/api/bids.api";
import { Alert } from "@/lib/utils/alert";
import type { CreateBidInput } from "@/lib/types/bid.types";

export const useJobBids = (jobId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.jobBids(jobId),
    queryFn: async () => {
      const res = await bidsApi.getJobBids(jobId);
      return res.data;
    },
    enabled: !!jobId,
  });

export const useCreateBid = (jobId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CreateBidInput, "jobId">) =>
      bidsApi.createBid({ ...data, jobId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.jobBids(jobId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.job(jobId) });
      Alert.toast("Đặt thầu thành công!", "success");
    },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Đặt thầu thất bại"),
  });
};

export const useWithdrawBid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const confirmed = await Alert.confirm("Rút bid?", "Bạn sẽ rút bid khỏi công việc này.");
      if (!confirmed.isConfirmed) throw new Error("cancelled");
      return bidsApi.withdrawBid(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bids"] });
      Alert.toast("Đã rút bid", "success");
    },
    onError: (err: any) => {
      if (err.message !== "cancelled") Alert.error(err?.response?.data?.message || "Rút bid thất bại");
    },
  });
};
