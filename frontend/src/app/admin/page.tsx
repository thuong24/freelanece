"use client";
import { adminApi } from "@/lib/api/admin.api";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { formatCurrency } from "@/lib/utils/format";
import { Users, Briefcase, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.adminStats,
    queryFn: async () => { const r = await adminApi.getStats(); return r.data.data; },
  });

  if (isLoading) return <PageSpinner />;

  const stats = [
    { label: "Tổng người dùng", value: data?.totalUsers ?? 0, icon: Users, color: "text-indigo-400" },
    { label: "Tổng công việc", value: data?.totalJobs ?? 0, icon: Briefcase, color: "text-blue-400" },
    { label: "Tổng hợp đồng", value: data?.totalContracts ?? 0, icon: FileText, color: "text-purple-400" },
    { label: "Doanh thu sàn", value: formatCurrency(parseFloat(String(data?.platformRevenue ?? 0))), icon: TrendingUp, color: "text-green-400", isText: true },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.isText ? s.color : "text-slate-100"}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/users">
          <Card hover className="flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="text-slate-100 font-medium">Quản lý người dùng</p>
              <p className="text-slate-400 text-xs">Ban, unban, khóa tính năng</p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/disputes">
          <Card hover className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-slate-100 font-medium">Phân xử khiếu nại</p>
              <p className="text-slate-400 text-xs">Giải quyết tranh chấp hợp đồng</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
