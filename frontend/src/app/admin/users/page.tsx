"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin.api";
import { QUERY_KEYS } from "@/lib/hooks/queryKeys";
import { Alert } from "@/lib/utils/alert";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Search, Ban, CheckCircle, Lock } from "lucide-react";
import type { AdminUser } from "@/lib/types/admin.types";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.adminUsers({ search, page }),
    queryFn: async () => { const r = await adminApi.getUsers({ search, page, limit: 20 }); return r.data; },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "BANNED" }) =>
      adminApi.updateUserStatus(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); Alert.toast("Cập nhật thành công", "success"); },
    onError: (err: any) => Alert.error(err?.response?.data?.message || "Thất bại"),
  });

  const handleBan = async (user: AdminUser) => {
    const isCurrentlyBanned = user.status === "BANNED";
    const confirmed = await Alert.confirm(
      isCurrentlyBanned ? `Bỏ ban ${user.name}?` : `Ban ${user.name}?`,
      isCurrentlyBanned ? "Người dùng có thể đăng nhập lại." : "Người dùng sẽ bị khóa tài khoản."
    );
    if (confirmed.isConfirmed) {
      updateStatus.mutate({ id: user.id, status: isCurrentlyBanned ? "ACTIVE" : "BANNED" });
    }
  };

  const users: AdminUser[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Quản lý người dùng</h1>
        <Badge variant="info">{data?.meta?.total ?? 0} users</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        : (
          <Card padding="none">
            <div className="divide-y divide-slate-800">
              {users.map((u) => (
                <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar name={u.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-slate-200 font-medium truncate max-w-[150px] sm:max-w-none">{u.name}</p>
                        <Badge variant={u.role === "ADMIN" ? "purple" : "default"}>{u.role}</Badge>
                        <Badge variant={u.status === "ACTIVE" ? "success" : u.status === "BANNED" ? "danger" : "warning"}>
                          {u.status}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-xs truncate max-w-[250px] sm:max-w-none">{u.email} · Tham gia {formatDate(u.createdAt)}</p>
                      {u.wallet && (
                        <p className="text-slate-500 text-xs mt-0.5">
                          Ví: {formatCurrency(parseFloat(u.wallet.availableBalance))} khả dụng
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    {u.role !== "ADMIN" && (
                      <Button
                        size="sm"
                        fullWidth
                        className="sm:w-auto"
                        variant={u.status === "BANNED" ? "secondary" : "danger"}
                        onClick={() => handleBan(u)}
                        loading={updateStatus.isPending}
                      >
                        {u.status === "BANNED" ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        {u.status === "BANNED" ? "Unban" : "Ban"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
    </div>
  );
}
