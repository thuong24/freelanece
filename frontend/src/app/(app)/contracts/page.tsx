"use client";
import { useState } from "react";
import { useContracts } from "@/lib/hooks/useContracts";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Pagination } from "@/components/ui/Pagination";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { ContractStatus } from "@/lib/types/contract.types";

const TABS = [
  { id: "", label: "Tất cả" },
  { id: "IN_PROGRESS", label: "Đang thực hiện" },
  { id: "WAITING_FOR_REVIEW", label: "Chờ nghiệm thu" },
  { id: "DONE", label: "Hoàn thành" },
  { id: "DISPUTED", label: "Tranh chấp" },
  { id: "CANCELLED", label: "Đã hủy" },
];

export default function ContractsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);

  const filters = { page, limit: 10, ...(activeTab && { status: activeTab }) };
  const { data, isLoading } = useContracts(filters);

  const contracts = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Hợp đồng của tôi</h1>
        <p className="text-slate-400 text-sm mt-0.5">Quản lý tất cả hợp đồng đang thực hiện</p>
      </div>

      <Tabs
        tabs={TABS}
        active={activeTab}
        onChange={(id) => { setActiveTab(id); setPage(1); }}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Không có hợp đồng"
          description="Các hợp đồng của bạn sẽ xuất hiện ở đây sau khi chốt deal."
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const isClient = contract.clientId === user?.id;
            const partner = isClient ? contract.freelancer : contract.client;
            return (
              <Link key={contract.id} href={`/contracts/${contract.id}`}>
                <Card hover className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ContractStatusBadge status={contract.status as ContractStatus} />
                      <span className="text-xs text-slate-500">#{contract.id.slice(0, 8)}</span>
                    </div>
                    <p className="text-slate-200 font-medium truncate">{contract.job?.title ?? "Hợp đồng"}</p>
                    {partner && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Avatar name={partner.name} src={partner.avatarUrl} size="sm" />
                        <span className="text-slate-400 text-xs">
                          {isClient ? "Freelancer:" : "Client:"} {partner.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-green-400 font-bold">{formatCurrency(parseFloat(contract.lockedAmount))}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Deadline: {formatDate(contract.deadlineAt)}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {meta && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  );
}
