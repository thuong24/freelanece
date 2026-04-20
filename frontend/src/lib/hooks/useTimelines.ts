"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";
import { timelinesApi } from "@/lib/api/timelines.api";
import { milestonesApi } from "@/lib/api/milestones.api";
import { reviewsApi } from "@/lib/api/reviews.api";
import { Alert } from "@/lib/utils/alert";

// Timelines
export const useTimelines = (contractId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.timelines(contractId),
    queryFn: async () => {
      const res = await timelinesApi.getTimelines(contractId);
      return res.data.data;
    },
    enabled: !!contractId,
  });

export const useCreateTimeline = (contractId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { action: string; description: string }) => timelinesApi.createTimeline(contractId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.timelines(contractId) });
      Alert.toast("Đã cập nhật tiến độ", "success");
    },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Thất bại"),
  });
};

// Milestones
export const useMilestones = (contractId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.milestones(contractId),
    queryFn: async () => {
      const res = await milestonesApi.createMilestones(contractId, []);
      return res.data.data;
    },
    enabled: false, // Chỉ fetch khi cần
  });

export const useApproveMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const confirmed = await Alert.confirm("Duyệt milestone?", "Tiền sẽ được giải ngân cho Freelancer cho milestone này.");
      if (!confirmed.isConfirmed) throw new Error("cancelled");
      return milestonesApi.approveMilestone(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milestones"] });
      Alert.toast("Milestone đã được duyệt và giải ngân", "success");
    },
    onError: (err: any) => {
      if (err.message !== "cancelled") Alert.error(err?.response?.data?.message || "Thất bại");
    },
  });
};

// Reviews
export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.createReview,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contract(vars.contractId) });
      Alert.toast("Đánh giá của bạn đã được ghi nhận!", "success");
    },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Đánh giá thất bại"),
  });
};
