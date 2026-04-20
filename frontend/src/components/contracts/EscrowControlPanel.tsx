"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  useSubmitDemo, useApproveDemo, useRejectDemo,
  useSubmitFinal, useRequestRevision, useAcceptContract,
  useRequestExtension, useApproveExtension, useRejectExtension,
  useRequestMutualCancel, useApproveMutualCancel, useRejectMutualCancel,
  usePingFreelancer, useForceCancel,
} from "@/lib/hooks/useContracts";
import { useCreateDispute } from "@/lib/hooks/useDisputes";
import type { Contract } from "@/lib/types/contract.types";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  Upload, CheckCircle, XCircle, AlertTriangle, Clock,
  Ban, RefreshCw, Bell, Zap, Shield,
} from "lucide-react";

interface Props { contract: Contract; isClient: boolean; isFreelancer: boolean; }

export const EscrowControlPanel = ({ contract, isClient, isFreelancer }: Props) => {
  const [modal, setModal] = useState<string | null>(null);
  const { register: regDemo, handleSubmit: submitDemoForm, formState: { errors: errorsDemo }, reset: resetDemo } = useForm<any>();
  const { register: regReject, handleSubmit: submitRejectForm, reset: resetReject } = useForm<any>();
  const { register: regFinal, handleSubmit: submitFinalForm, reset: resetFinal, watch: watchFinal, formState: { errors: errorsFinal } } = useForm<any>();
  const { register: regRevision, handleSubmit: submitRevisionForm, reset: resetRevision } = useForm<any>();
  const { register: regExtension, handleSubmit: submitExtensionForm, reset: resetExtension } = useForm<any>();
  const { register: regCancel, handleSubmit: submitCancelForm, reset: resetCancel } = useForm<any>();
  const { register: regDispute, handleSubmit: submitDisputeForm, reset: resetDispute, formState: { errors: errorsDispute } } = useForm<any>();

  // Hooks
  const submitDemo = useSubmitDemo();
  const approveDemo = useApproveDemo();
  const rejectDemo = useRejectDemo();
  const submitFinal = useSubmitFinal();
  const requestRevision = useRequestRevision();
  const acceptContract = useAcceptContract();
  const requestExtension = useRequestExtension();
  const approveExtension = useApproveExtension();
  const rejectExtension = useRejectExtension();
  const requestMutualCancel = useRequestMutualCancel();
  const approveMutualCancel = useApproveMutualCancel();
  const rejectMutualCancel = useRejectMutualCancel();
  const pingFreelancer = usePingFreelancer();
  const forceCancel = useForceCancel();
  const createDispute = useCreateDispute();

  const id = contract.id;
  const status = contract.status;
  const isPending = (hook: any) => hook.isPending;

  const closeModal = () => { 
    setModal(null); 
    resetDemo(); resetReject(); resetFinal(); resetRevision(); resetExtension(); resetCancel(); resetDispute();
  };
  const exec = (hook: any, data?: any) => hook.mutate({ id, data }, { onSuccess: closeModal });
  const execWith = (hook: any, formData: any) => exec(hook, formData);

  // Status badge with color indicator bar
  const statusColors: Record<string, string> = {
    IN_PROGRESS: "bg-blue-500",
    WAITING_DEMO_APPROVAL: "bg-amber-500",
    WAITING_SOURCE_CODE: "bg-purple-500",
    WAITING_FOR_REVIEW: "bg-indigo-500",
    REVISION_REQUESTED: "bg-orange-500",
    DISPUTED: "bg-red-500",
    DONE: "bg-green-500",
    CANCELLED: "bg-slate-500",
    EXPIRED: "bg-red-600",
  };

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <Card className="overflow-hidden p-0">
        <div className={`h-1.5 ${statusColors[status] ?? "bg-slate-600"}`} />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Ngân sách</p>
            <p className="text-green-400 font-bold">{formatCurrency(parseFloat(contract.budget))}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Đang giam</p>
            <p className="text-amber-400 font-bold">{formatCurrency(parseFloat(contract.lockedAmount))}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Deadline</p>
            <p className="text-slate-200 font-semibold">{formatDate(contract.deadlineAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Phạt trễ</p>
            <p className="text-red-400 font-semibold">{formatCurrency(parseFloat(contract.penaltyAmount))}</p>
          </div>
        </div>
      </Card>

      {/* ─────────────── FREELANCER ACTIONS ─────────────── */}
      {isFreelancer && (
        <Card>
          <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> Hành động của Freelancer
          </h3>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {status === "IN_PROGRESS" && (
              <Button type="button" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModal("submitDemo"); }}>
                <Upload className="w-4 h-4" /> Nộp Demo
              </Button>
            )}
            {(status === "WAITING_SOURCE_CODE" || status === "REVISION_REQUESTED") && (
              <Button size="sm" onClick={() => setModal("submitFinal")}>
                <CheckCircle className="w-4 h-4" /> Nộp bài (Source Code)
              </Button>
            )}
            {(status === "IN_PROGRESS" || status === "REVISION_REQUESTED") && (
              <>
                {contract.extensionRequest?.status === "PENDING" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" /> Đang chờ duyệt gia hạn
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setModal("requestExtension")}>
                    <Clock className="w-4 h-4" /> Xin gia hạn
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => setModal("mutualCancel")}>
                  <Ban className="w-4 h-4" /> Đề nghị hủy
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* ─────────────── CLIENT ACTIONS ─────────────── */}
      {isClient && (
        <Card>
          <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" /> Hành động của Client
          </h3>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {status === "WAITING_DEMO_APPROVAL" && (
              <>
                <Button size="sm" onClick={() => exec(approveDemo)}>
                  <CheckCircle className="w-4 h-4" /> Duyệt Demo
                </Button>
                <Button size="sm" variant="danger" onClick={() => setModal("rejectDemo")}>
                  <XCircle className="w-4 h-4" /> Từ chối Demo
                </Button>
              </>
            )}
            {status === "WAITING_FOR_REVIEW" && (
              <>
                <Button size="sm" onClick={() => acceptContract.mutate({ id, amount: contract.lockedAmount })}>
                  <CheckCircle className="w-4 h-4" /> Nghiệm thu & Giải ngân
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setModal("requestRevision")}>
                  <RefreshCw className="w-4 h-4" /> Yêu cầu sửa
                </Button>
                <Button size="sm" variant="danger" onClick={() => setModal("openDispute")}>
                  <AlertTriangle className="w-4 h-4" /> Mở khiếu nại
                </Button>
              </>
            )}
            {status === "IN_PROGRESS" && (
              <>
                {contract.miaWarned ? (
                  <Button size="sm" variant="danger" onClick={() => exec(forceCancel)}>
                    <Ban className="w-4 h-4" /> Hủy cưỡng bức (MIA)
                  </Button>
                ) : (
                  <Button size="sm" variant="warning" onClick={() => exec(pingFreelancer)}>
                    <Bell className="w-4 h-4" /> Cảnh báo vắng mặt (MIA)
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => setModal("mutualCancel")}>
                  <Ban className="w-4 h-4" /> Đề nghị hủy
                </Button>
              </>
            )}
            {/* Extension responses */}
            {contract.extensionRequest?.status === "PENDING" && (
              <div className="w-full p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-amber-400 text-sm font-medium mb-2">
                  📅 Freelancer xin gia hạn {contract.extensionRequest.requestedDays} ngày
                </p>
                <p className="text-slate-400 text-xs mb-3">{contract.extensionRequest.reason}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => exec(approveExtension)}>Đồng ý</Button>
                  <Button size="sm" variant="danger" onClick={() => exec(rejectExtension)}>Từ chối</Button>
                </div>
              </div>
            )}
            {/* Mutual cancel response */}
            {contract.mutualCancel?.status === "REQUESTED" && contract.mutualCancel.requestedById !== (isClient ? contract.clientId : contract.freelancerId) && (
              <div className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm font-medium mb-2">⚠️ Đối tác muốn hủy hợp đồng</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="danger" onClick={() => exec(approveMutualCancel)}>Đồng ý hủy</Button>
                  <Button size="sm" variant="outline" onClick={() => exec(rejectMutualCancel)}>Từ chối</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Submit Demo */}
      <Modal open={modal === "submitDemo"} onClose={closeModal} title="Nộp Demo">
        <form onSubmit={submitDemoForm((d) => execWith(submitDemo, d))} className="space-y-4">
          <Input 
            label="Link Demo *" 
            placeholder="https://..." 
            {...regDemo("demoUrl", { 
              required: "Vui lòng nhập link demo",
              pattern: {
                value: /^(https?:\/\/)[^\s$.?#].[^\s]*$/i,
                message: "Link không hợp lệ (phải bắt đầu bằng http:// hoặc https://)"
              }
            })} 
            error={errorsDemo.demoUrl?.message as string}
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Huỷ</Button>
            <Button type="submit" fullWidth loading={isPending(submitDemo)}>Nộp Demo</Button>
          </div>
        </form>
      </Modal>

      {/* Reject Demo */}
      <Modal open={modal === "rejectDemo"} onClose={closeModal} title="Từ chối Demo">
        <form onSubmit={submitRejectForm((d) => execWith(rejectDemo, d))} className="space-y-4">
          <Textarea label="Lý do từ chối *" rows={3} {...regReject("reason", { required: true })} />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Huỷ</Button>
            <Button type="submit" variant="danger" fullWidth loading={isPending(rejectDemo)}>Xác nhận từ chối</Button>
          </div>
        </form>
      </Modal>

      {/* Submit Final */}
      <Modal open={modal === "submitFinal"} onClose={closeModal} title="Nộp Source Code">
        <form onSubmit={submitFinalForm((d) => execWith(submitFinal, d))} className="space-y-4">
          <Input 
            label="Link Source Code *" 
            placeholder="https://github.com/..." 
            {...regFinal("sourceCodeUrl", { 
              required: "Vui lòng nhập link source code",
              pattern: {
                value: /^(https?:\/\/)[^\s$.?#].[^\s]*$/i,
                message: "Link không hợp lệ"
              }
            })} 
            error={errorsFinal.sourceCodeUrl?.message as string}
          />
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" {...regFinal("readmeConfirmed", { required: true })} />
              Tôi xác nhận source code có README.md hướng dẫn cài đặt
            </label>
            {errorsFinal.readmeConfirmed && <p className="text-xs text-red-400">Bạn cần xác nhận nội dung này</p>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Huỷ</Button>
            <Button 
              type="submit" 
              fullWidth 
              loading={isPending(submitFinal)} 
              disabled={!watchFinal("readmeConfirmed")}
            >
              Nộp Source Code
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Revision */}
      <Modal open={modal === "requestRevision"} onClose={closeModal} title="Yêu cầu chỉnh sửa">
        <form onSubmit={submitRevisionForm((d) => execWith(requestRevision, d))} className="space-y-4">
          <Textarea label="Yêu cầu cụ thể *" rows={4} placeholder="Mô tả những điểm cần sửa..." {...regRevision("reason", { required: true })} />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Huỷ</Button>
            <Button type="submit" fullWidth loading={isPending(requestRevision)}>Gửi yêu cầu</Button>
          </div>
        </form>
      </Modal>

      {/* Request Extension */}
      <Modal open={modal === "requestExtension"} onClose={closeModal} title="Xin gia hạn deadline">
        <form onSubmit={submitExtensionForm((d) => execWith(requestExtension, d))} className="space-y-4">
          <Input label="Số ngày cần thêm *" type="number" min={1} {...regExtension("requestedDays", { required: true, valueAsNumber: true })} />
          <Textarea label="Lý do *" rows={3} {...regExtension("reason", { required: true })} />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Huỷ</Button>
            <Button type="submit" fullWidth loading={isPending(requestExtension)}>Gửi yêu cầu</Button>
          </div>
        </form>
      </Modal>

      {/* Mutual Cancel */}
      <Modal open={modal === "mutualCancel"} onClose={closeModal} title="Đề nghị hủy hợp đồng">
        <form onSubmit={submitCancelForm((d) => execWith(requestMutualCancel, d))} className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-amber-400 text-sm">⚠️ Khi được đối tác đồng ý, tiền sẽ được hoàn lại 100% cho Client.</p>
          </div>
          <Textarea label="Lý do hủy *" rows={3} {...regCancel("reason", { required: true })} />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Huỷ</Button>
            <Button type="submit" variant="danger" fullWidth loading={isPending(requestMutualCancel)}>Gửi đề nghị hủy</Button>
          </div>
        </form>
      </Modal>

      {/* Open Dispute */}
      <Modal open={modal === "openDispute"} onClose={closeModal} title="Mở khiếu nại" size="lg">
        <form onSubmit={submitDisputeForm((d) => {
          const payload = { ...d };
          if (!payload.evidenceUrl) delete payload.evidenceUrl;
          createDispute.mutate({ contractId: id, ...payload }, { onSuccess: closeModal });
        })} className="space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">⚖️ Tiền sẽ bị đóng băng đến khi Admin phân xử. Vui lòng cung cấp bằng chứng đầy đủ.</p>
          </div>
          <Textarea 
            label="Lý do khiếu nại *" 
            rows={5} 
            placeholder="Mô tả chi tiết vấn đề (tối thiểu 20 ký tự)..." 
            {...regDispute("reason", { 
              required: "Vui lòng nhập lý do khiếu nại",
              minLength: { value: 20, message: "Lý do phải có ít nhất 20 ký tự" }
            })} 
            error={errorsDispute.reason?.message as string}
          />
          <Input 
            label="Link bằng chứng (tuỳ chọn)" 
            placeholder="https://..." 
            {...regDispute("evidenceUrl", {
              pattern: {
                value: /^(https?:\/\/)[^\s$.?#].[^\s]*$/i,
                message: "Link không hợp lệ"
              }
            })} 
            error={errorsDispute.evidenceUrl?.message as string}
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Huỷ</Button>
            <Button type="submit" variant="danger" fullWidth loading={isPending(createDispute)}>Mở khiếu nại</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
