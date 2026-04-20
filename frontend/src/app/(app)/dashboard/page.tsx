"use client";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useWallet } from "@/lib/hooks/useWallet";
import { useContracts } from "@/lib/hooks/useContracts";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatRelativeTime } from "@/lib/utils/format";
import { Briefcase, FileText, Bell, Wallet, Plus, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import type { ContractStatus } from "@/lib/types/contract.types";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: contractsData } = useContracts({ page: 1, limit: 5 });
  const { data: notifData } = useNotifications({ page: 1, limit: 5, isRead: false });

  const contracts = contractsData?.data ?? [];
  const notifications = notifData?.data?.notifications ?? [];
  const unreadCount = notifData?.data?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user && <Avatar name={user.name} src={user.avatarUrl} size="lg" />}
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Xin chào, {user?.name?.split(" ").pop()}! 👋</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Quota: {user?.freePostQuota} bài đăng · {user?.freeBidQuota} bid còn lại hôm nay
            </p>
          </div>
        </div>
        <Link href="/jobs/create">
          <Button><Plus className="w-4 h-4" /> Đăng việc</Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
          <Wallet className="w-5 h-5 text-indigo-400 mb-2" />
          <p className="text-xs text-slate-400 mb-1">Số dư khả dụng</p>
          {walletLoading
            ? <Skeleton className="h-7 w-28" />
            : <p className="text-xl font-bold text-slate-100">{formatCurrency(parseFloat(wallet?.availableBalance ?? "0"))}</p>
          }
        </Card>

        <Card>
          <Lock className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-xs text-slate-400 mb-1">Đang giam Escrow</p>
          {walletLoading
            ? <Skeleton className="h-7 w-28" />
            : <p className="text-xl font-bold text-amber-400">{formatCurrency(parseFloat(wallet?.lockedBalance ?? "0"))}</p>
          }
        </Card>

        <Card>
          <FileText className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-xs text-slate-400 mb-1">Hợp đồng đang chạy</p>
          <p className="text-xl font-bold text-slate-100">
            {contracts.filter((c) => c.status === "IN_PROGRESS").length}
          </p>
        </Card>

        <Card>
          <Bell className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-xs text-slate-400 mb-1">Thông báo chưa đọc</p>
          <p className="text-xl font-bold text-purple-400">{unreadCount}</p>
        </Card>
      </div>

      {/* Active Contracts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hợp đồng gần đây</CardTitle>
              <Link href="/contracts">
                <Button variant="ghost" size="sm">Xem tất cả <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            </div>
          </CardHeader>
          {contracts.length === 0 ? (
            <CardContent>Chưa có hợp đồng nào</CardContent>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {contracts.map((c) => (
                <Link key={c.id} href={`/contracts/${c.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors">
                    <ContractStatusBadge status={c.status as ContractStatus} />
                    <p className="flex-1 text-slate-300 text-sm truncate">{c.job?.title ?? `#${c.id.slice(0, 8)}`}</p>
                    <span className="text-green-400 text-sm font-semibold shrink-0">
                      {formatCurrency(parseFloat(c.lockedAmount))}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Thông báo mới</CardTitle>
              <Link href="/notifications">
                <Button variant="ghost" size="sm">Tất cả <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            </div>
          </CardHeader>
          {notifications.length === 0 ? (
            <CardContent>Không có thông báo mới</CardContent>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <p className="text-slate-200 text-sm font-medium">{n.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-slate-600 text-xs mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/jobs">
          <Card hover className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="text-slate-100 font-medium">Tìm việc</p>
              <p className="text-slate-400 text-xs">Duyệt công việc mới nhất</p>
            </div>
          </Card>
        </Link>
        <Link href="/wallet">
          <Card hover className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-slate-100 font-medium">Quản lý ví</p>
              <p className="text-slate-400 text-xs">Nạp & rút tiền</p>
            </div>
          </Card>
        </Link>
        <Link href="/settings/profile">
          <Card hover className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]}
            </div>
            <div>
              <p className="text-slate-100 font-medium">Hồ sơ</p>
              <p className="text-slate-400 text-xs">Cập nhật thông tin cá nhân</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
