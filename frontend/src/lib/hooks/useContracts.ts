"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";
import { contractsApi } from "@/lib/api/contracts.api";
import { Alert } from "@/lib/utils/alert";
import { formatCurrency } from "@/lib/utils/format";

export const useContracts = (filters?: object) =>
  useQuery({
    queryKey: QUERY_KEYS.contracts(filters),
    queryFn: async () => {
      const res = await contractsApi.getContracts(filters as any);
      return res.data;
    },
  });

export const useContract = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.contract(id),
    queryFn: async () => {
      const res = await contractsApi.getContract(id);
      return res.data.data;
    },
    enabled: !!id,
    refetchInterval: 30000, // Refresh mỗi 30 giây để cập nhật trạng thái
  });

export const useAcceptBid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bidId, amount }: { bidId: string; amount: string }) => {
      const confirmed = await Alert.escrowConfirm(formatCurrency(parseFloat(amount)));
      if (!confirmed.isConfirmed) throw new Error("cancelled");
      return contractsApi.acceptBid(bidId);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      Alert.toast("Hợp đồng đã được tạo! Tiền đã bị giam vào Escrow.", "success");
    },
    onError: (err: any) => {
      if (err.message !== "cancelled") Alert.error(err?.response?.data?.message || "Thất bại");
    },
  });
};

const contractMutation = (
  fn: (id: string, data?: any) => Promise<any>,
  successMsg: string,
  confirmFn?: () => Promise<any>
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data?: any }) => {
      if (confirmFn) {
        const confirmed = await confirmFn();
        if (!confirmed.isConfirmed) throw new Error("cancelled");
      }
      return fn(id, data);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contract(vars.id) });
      Alert.toast(successMsg, "success");
    },
    onError: (err: any) => {
      if (err.message !== "cancelled") Alert.error(err?.response?.data?.message || "Thao tác thất bại");
    },
  });
};

export const useSubmitDemo = () => contractMutation(contractsApi.submitDemo, "Đã nộp demo thành công");
export const useApproveDemo = () => contractMutation(contractsApi.approveDemo, "Đã duyệt demo");
export const useRejectDemo = () => contractMutation(contractsApi.rejectDemo, "Đã từ chối demo");
export const useSubmitFinal = () => contractMutation(contractsApi.submitFinal, "Đã nộp source code thành công");
export const useRequestRevision = () => contractMutation(contractsApi.requestRevision, "Đã yêu cầu chỉnh sửa");

export const useAcceptContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: string }) => {
      const confirmed = await Alert.releaseConfirm(formatCurrency(parseFloat(amount)));
      if (!confirmed.isConfirmed) throw new Error("cancelled");
      return contractsApi.acceptContract(id);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.contract(vars.id) });
      Alert.toast("🎉 Nghiệm thu thành công! Tiền đã giải ngân cho Freelancer.", "success");
    },
    onError: (err: any) => {
      if (err.message !== "cancelled") Alert.error(err?.response?.data?.message || "Thất bại");
    },
  });
};

export const useRequestExtension = () =>
  contractMutation(contractsApi.requestExtension, "Đã gửi yêu cầu gia hạn");

export const useApproveExtension = () =>
  contractMutation(contractsApi.approveExtension, "Đã chấp thuận gia hạn deadline");

export const useRejectExtension = () =>
  contractMutation(contractsApi.rejectExtension, "Đã từ chối gia hạn");

export const useRequestMutualCancel = () =>
  contractMutation(contractsApi.requestMutualCancel, "Đã gửi yêu cầu hủy hợp đồng", Alert.cancelConfirm);

export const useApproveMutualCancel = () =>
  contractMutation(contractsApi.approveMutualCancel, "Đã đồng ý hủy hợp đồng. Tiền được hoàn lại.");

export const useRejectMutualCancel = () =>
  contractMutation(contractsApi.rejectMutualCancel, "Đã từ chối yêu cầu hủy");

export const usePingFreelancer = () =>
  contractMutation(contractsApi.pingFreelancer, "Đã gửi cảnh báo đến Freelancer");

export const useForceCancel = () =>
  contractMutation(contractsApi.forceCancel, "Đã hủy hợp đồng. Tiền hoàn về ví của bạn.");
