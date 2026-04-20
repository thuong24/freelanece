"use client";
import { useState } from "react";
import { useDispute, useResolveDispute } from "@/lib/hooks/useDisputes";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { PageSpinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ArrowLeft, Scale } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

export default function AdminDisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: dispute, isLoading } = useDispute(id);
  const { mutate: resolve, isPending } = useResolveDispute();
  const [refundPct, setRefundPct] = useState(0);
  const { register, handleSubmit } = useForm<any>();

  if (isLoading) return <PageSpinner />;
  if (!dispute) return <div className="text-center py-20 text-slate-400">Không tìm thấy khiếu nại</div>;

  const lockedAmount = parseFloat(dispute.contract?.lockedAmount ?? "0");
  const clientGets = (lockedAmount * refundPct) / 100;
  const freelancerGets = lockedAmount - clientGets;

  const onSubmit = (data: any) => {
    resolve({ id, data: { resolutionInfo: data.resolutionInfo, refundPercentage: refundPct } });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/disputes">
        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Danh sách khiếu nại</Button>
      </Link>

      <div className="flex items-center gap-2">
        <Scale className="w-6 h-6 text-red-400" />
        <h1 className="text-xl font-bold text-slate-100">Phân xử khiếu nại</h1>
        <Badge variant="danger">{dispute.status}</Badge>
      </div>

      {/* Dispute Info */}
      <Card>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-slate-100">Chi tiết khiếu nại</h3>
          <p className="text-xs text-slate-500">ID: {id}</p>
        </div>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-500">Người mở</p>
              <p className="text-slate-200">{dispute.openedBy?.name} <Badge variant="outline" className="ml-1 uppercase text-[10px]">{dispute.openedBy?.role}</Badge></p>
            </div>
            <div>
              <p className="text-slate-500">Thời gian</p>
              <p className="text-slate-200">{formatDate(dispute.createdAt)}</p>
            </div>
          </div>
          
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
            <p className="text-xs text-red-400 font-semibold mb-2 uppercase tracking-wider">Lý do khiếu nại:</p>
            <p className="text-slate-200 leading-relaxed italic">"{dispute.reason}"</p>
          </div>

          {dispute.attachmentsJson && (
            <div className="pt-2">
              <p className="text-xs text-slate-500 mb-2 font-medium">BẰNG CHỨNG ĐÍNH KÈM:</p>
              <a 
                href={dispute.attachmentsJson} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors border border-slate-700"
              >
                🔗 Xem tài liệu bằng chứng
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* Contract Info */}
      {dispute.contract && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-100">Bối cảnh hợp đồng</h3>
            <Link href={`/contracts/${dispute.contract.id}`} target="_blank" className="text-xs text-indigo-400 hover:underline">
              Xem chi tiết hợp đồng ↗
            </Link>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Công việc:</p>
              <p className="text-slate-200 font-medium">{dispute.contract.job?.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-500 text-xs mb-1">Khách hàng</p>
                <p className="text-slate-200 font-medium">{dispute.contract.client?.name}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-500 text-xs mb-1">Freelancer</p>
                <p className="text-slate-200 font-medium">{dispute.contract.freelancer?.name}</p>
              </div>
              <div className="col-span-2 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Số tiền đang bị đóng băng</p>
                  <p className="text-indigo-100 text-2xl font-black mt-1">{formatCurrency(lockedAmount)}</p>
                </div>
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">ESCROW LOCKED</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Resolution Form */}
      {dispute.status !== "RESOLVED" && dispute.status !== "CLOSED" && (
        <Card>
          <h3 className="font-semibold text-slate-100 mb-4">Phán quyết</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Slider */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Client nhận: <span className="text-blue-400 font-bold">{formatCurrency(clientGets)} ({refundPct}%)</span></span>
                <span className="text-slate-400">Freelancer nhận: <span className="text-green-400 font-bold">{formatCurrency(freelancerGets)} ({100 - refundPct}%)</span></span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={refundPct}
                onChange={(e) => setRefundPct(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>0% cho Client</span>
                <span>100% cho Client</span>
              </div>
            </div>

            <Textarea
              label="Lý do phán quyết *"
              rows={4}
              placeholder="Giải thích quyết định phân chia tiền..."
              {...register("resolutionInfo", { required: true })}
            />

            <Button type="submit" fullWidth loading={isPending} variant="primary">
              ⚖️ Xác nhận phán quyết
            </Button>
          </form>
        </Card>
      )}

      {dispute.status === "RESOLVED" && (
        <Card className="border-green-500/30 bg-green-500/5">
          <p className="text-green-400 font-semibold">✅ Khiếu nại đã được phân xử</p>
          <p className="text-slate-400 text-sm mt-1">{dispute.adminDecision}</p>
        </Card>
      )}
    </div>
  );
}
