"use client";
import { useState } from "react";
import { useContract } from "@/lib/hooks/useContracts";
import { useAuthStore } from "@/lib/stores/auth.store";
import { EscrowControlPanel } from "@/components/contracts/EscrowControlPanel";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { ReviewForm } from "@/components/contracts/ReviewForm";
import { TimelineList } from "@/components/timelines/TimelineList";
import { ChatBox } from "@/components/chat/ChatBox";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ContractStatus } from "@/lib/types/contract.types";

const TABS = [
  { id: "overview", label: "Tổng quan" },
  { id: "timeline", label: "Tiến độ" },
  { id: "chat", label: "Chat" },
];

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: contract, isLoading } = useContract(id);
  const { user } = useAuthStore();
  const [tab, setTab] = useState("overview");

  if (isLoading) return <PageSpinner />;
  if (!contract) return <div className="text-center py-20 text-slate-400">Không tìm thấy hợp đồng</div>;

  const isClient = contract.clientId === user?.id;
  const isFreelancer = contract.freelancerId === user?.id;
  const isDone = contract.status === "DONE";
  const isActive = !["DONE", "CANCELLED", "EXPIRED"].includes(contract.status);

  const partner = isClient ? contract.freelancer : contract.client;
  const partnerRole = isClient ? "Freelancer" : "Client";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/contracts">
        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Danh sách hợp đồng</Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            <ContractStatusBadge status={contract.status as ContractStatus} />
            <span className="text-slate-500 text-xs font-mono">#{id.slice(0, 8).toUpperCase()}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">{contract.job?.title ?? "Hợp đồng"}</h1>
        </div>

        {/* Partner info */}
        {partner && (
          <Card padding="sm" className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <Avatar name={partner.name} src={partner.avatarUrl} size="sm" />
            <div>
              <p className="text-xs text-slate-500">{partnerRole}</p>
              <p className="text-slate-200 text-sm font-medium">{partner.name}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Escrow Control Panel (only for active contracts) */}
      {isActive && (
        <EscrowControlPanel contract={contract} isClient={isClient} isFreelancer={isFreelancer} />
      )}

      {/* Tabs */}
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-slate-100 mb-4">Thông tin hợp đồng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-0.5">Tạo lúc</p>
                <p className="text-slate-200">{formatDate(contract.createdAt)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Deadline</p>
                <p className={`font-medium ${new Date(contract.deadlineAt) < new Date() && isActive ? "text-red-400" : "text-slate-200"}`}>
                  {formatDate(contract.deadlineAt)}
                  {new Date(contract.deadlineAt) < new Date() && isActive && " ⚠️ Đã quá hạn"}
                </p>
              </div>
              {contract.completedAt && (
                <div>
                  <p className="text-slate-500 mb-0.5">Hoàn thành lúc</p>
                  <p className="text-green-400">{formatDate(contract.completedAt)}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 mb-0.5">Phí sàn</p>
                <p className="text-slate-200">{(parseFloat(contract.platformFeeRate) * 100).toFixed(0)}%</p>
              </div>
              {contract.demoUrl && (
                <div className="col-span-2">
                  <p className="text-slate-500 mb-0.5">Link Demo</p>
                  <a href={contract.demoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all text-sm">
                    {contract.demoUrl}
                  </a>
                </div>
              )}
              {contract.sourceCodeUrl && (
                <div className="col-span-2">
                  <p className="text-slate-500 mb-0.5">Source Code</p>
                  <a href={contract.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all text-sm">
                    {contract.sourceCodeUrl}
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Review form after DONE */}
          {isDone && partner && (
            <ReviewForm contractId={id} partnerName={partner.name} />
          )}
        </div>
      )}

      {tab === "timeline" && (
        <TimelineList contractId={id} canAdd={isFreelancer && isActive} />
      )}

      {tab === "chat" && (
        <div>
          <div className="flex items-center gap-2 mb-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <span className="text-xs text-amber-400">⚠️</span>
            <p className="text-xs text-slate-400">Chat này được giám sát. Không chia sẻ thông tin liên hệ cá nhân.</p>
          </div>
          <ChatBox contractId={id} />
        </div>
      )}
    </div>
  );
}
