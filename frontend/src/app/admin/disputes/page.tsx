"use client";
import { useDisputes } from "@/lib/hooks/useDisputes";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime, formatCurrency } from "@/lib/utils/format";
import { Scale } from "lucide-react";
import Link from "next/link";

export default function AdminDisputesPage() {
  const { data, isLoading } = useDisputes({ status: "OPEN" });
  const disputes = data?.data ?? [];

  const statusVariant: Record<string, any> = {
    OPEN: "danger", UNDER_REVIEW: "warning", RESOLVED: "success", CLOSED: "default"
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Khiếu nại cần xử lý</h1>

      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        : disputes.length === 0
        ? <EmptyState icon={Scale} title="Không có khiếu nại nào" description="Tất cả khiếu nại đã được xử lý." />
        : (
          <div className="space-y-3">
            {disputes.map((d) => (
              <Link key={d.id} href={`/admin/disputes/${d.id}`}>
                <Card hover>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statusVariant[d.status]}>{d.status}</Badge>
                        <span className="text-slate-500 text-xs font-mono">#{d.id.slice(0, 8)}</span>
                      </div>
                      <p className="text-slate-200 font-medium text-sm line-clamp-1">{d.reason}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{formatRelativeTime(d.createdAt)}</p>
                    </div>
                    {d.contract && (
                      <div className="text-right shrink-0">
                        <p className="text-amber-400 font-bold">{formatCurrency(parseFloat(d.contract.lockedAmount))}</p>
                        <p className="text-slate-500 text-xs">đang giam</p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}
