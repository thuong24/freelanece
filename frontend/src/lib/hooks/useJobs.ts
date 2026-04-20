"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";
import { jobsApi } from "@/lib/api/jobs.api";
import { Alert } from "@/lib/utils/alert";
import type { JobFilters } from "@/lib/types/job.types";
import { useRouter } from "next/navigation";

export const useJobs = (filters?: JobFilters) =>
  useQuery({
    queryKey: QUERY_KEYS.jobs(filters),
    queryFn: async () => {
      const res = await jobsApi.getJobs(filters);
      return res.data;
    },
  });

export const useJob = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.job(id),
    queryFn: async () => {
      const res = await jobsApi.getJob(id);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateJob = () => {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: jobsApi.createJob,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.jobs() });
      Alert.toast("Đăng bài thành công!", "success");
      router.push(`/jobs/${res.data.data.id}`);
    },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Đăng bài thất bại"),
  });
};

export const useUpdateJob = (id: string) => {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (data: Parameters<typeof jobsApi.updateJob>[1]) => jobsApi.updateJob(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.job(id) });
      Alert.toast("Cập nhật thành công", "success");
      router.push(`/jobs/${id}`);
    },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Cập nhật thất bại"),
  });
};

export const useDeleteJob = () => {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (id: string) => {
      const confirmed = await Alert.confirm("Xóa bài đăng?", "Hành động này không thể hoàn tác.");
      if (!confirmed.isConfirmed) throw new Error("cancelled");
      return jobsApi.deleteJob(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.jobs() });
      Alert.toast("Đã xóa bài đăng", "success");
      router.push("/jobs");
    },
    onError: (err: any) => {
      if (err.message !== "cancelled") Alert.error(err?.response?.data?.message || "Xóa thất bại");
    },
  });
};

export const useBumpJob = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const confirmed = await Alert.confirm("Đẩy bài lên top?", "Phí bump sẽ bị trừ từ ví của bạn.");
      if (!confirmed.isConfirmed) throw new Error("cancelled");
      return jobsApi.bumpJob(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.job(id) });
      Alert.toast("Đã đẩy bài lên top!", "success");
    },
    onError: (err: any) => {
      if (err.message !== "cancelled") Alert.error(err?.response?.data?.message || "Đẩy top thất bại");
    },
  });
};
