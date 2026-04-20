"use client";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/lib/hooks/useNotifications";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils/format";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkAsRead();
  const { mutate: markAll } = useMarkAllAsRead();

  const notifications = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Thông báo</h1>
          {unreadCount > 0 && (
            <p className="text-slate-400 text-sm mt-0.5">{unreadCount} thông báo chưa đọc</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAll()}>
            <CheckCheck className="w-4 h-4" /> Đọc tất cả
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Chưa có thông báo" description="Các thông báo về bid, hợp đồng, và ví sẽ xuất hiện ở đây." />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-slate-800">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors",
                  !n.isRead && "bg-indigo-500/5 border-l-2 border-indigo-500"
                )}
                onClick={() => !n.isRead && markRead(n.id)}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full mt-2 shrink-0",
                  n.isRead ? "bg-slate-700" : "bg-indigo-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", n.isRead ? "text-slate-300" : "text-slate-100")}>
                    {n.title}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-slate-600 text-xs mt-1">{formatRelativeTime(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
