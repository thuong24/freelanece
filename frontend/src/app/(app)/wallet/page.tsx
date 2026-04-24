"use client";
import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useWallet, useTransactions, useDepositRequests } from "@/lib/hooks/useWallet";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { ArrowDownLeft, ArrowUpRight, Lock, Wallet as WalletIcon, TrendingUp, QrCode } from "lucide-react";
import type { TransactionType } from "@/lib/types/wallet.types";
import { DepositModal } from "@/components/wallet/DepositModal";
import { WithdrawModal } from "@/components/wallet/WithdrawModal";

const txConfig: Record<TransactionType, { label: string; color: string; icon: React.ReactNode }> = {
  DEPOSIT: { label: "Nạp tiền", color: "text-green-400", icon: <ArrowDownLeft className="w-4 h-4 text-green-400" /> },
  WITHDRAW: { label: "Rút tiền", color: "text-red-400", icon: <ArrowUpRight className="w-4 h-4 text-red-400" /> },
  ESCROW_LOCK: { label: "Giam Escrow", color: "text-amber-400", icon: <Lock className="w-4 h-4 text-amber-400" /> },
  ESCROW_RELEASE: { label: "Giải ngân", color: "text-green-400", icon: <TrendingUp className="w-4 h-4 text-green-400" /> },
  REFUND: { label: "Hoàn tiền", color: "text-blue-400", icon: <ArrowDownLeft className="w-4 h-4 text-blue-400" /> },
  LATE_PENALTY: { label: "Phạt trễ hạn", color: "text-red-400", icon: <ArrowUpRight className="w-4 h-4 text-red-400" /> },
  PLATFORM_FEE: { label: "Phí sàn", color: "text-slate-400", icon: <ArrowUpRight className="w-4 h-4 text-slate-400" /> },
  MILESTONE_RELEASE: { label: "Giải ngân Milestone", color: "text-green-400", icon: <TrendingUp className="w-4 h-4 text-green-400" /> },
  BONUS: { label: "Thưởng thêm", color: "text-yellow-400", icon: <TrendingUp className="w-4 h-4 text-yellow-400" /> },
};

export default function WalletPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [initialQr, setInitialQr] = useState<{ amount: number; code: string } | null>(null);

  const { data: wallet, isLoading } = useWallet();
  const { data: txData, isLoading: txLoading } = useTransactions();
  const { data: depositRequests, isLoading: reqLoading } = useDepositRequests();
  
  const transactions = txData?.data ?? [];

  if (isLoading) return <PageSpinner />;

  const available = parseFloat(wallet?.availableBalance ?? "0");
  const locked = parseFloat(wallet?.lockedBalance ?? "0");

  const openDepositWithQr = (amount: number, code: string) => {
    setInitialQr({ amount, code });
    setDepositOpen(true);
  };

  const handleDepositClose = () => {
    setDepositOpen(false);
    setTimeout(() => setInitialQr(null), 300); // clear after animation
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Ví của tôi</h1>
        <p className="text-slate-400 text-sm mt-0.5">Quản lý số dư và lịch sử giao dịch</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
          <div className="flex items-center gap-2 mb-3">
            <WalletIcon className="w-5 h-5 text-indigo-400" />
            <span className="text-sm text-slate-400">Số dư khả dụng</span>
          </div>
          <p className="text-3xl font-bold text-slate-100">{formatCurrency(available)}</p>
          {wallet?.holdUntil && new Date(wallet.holdUntil) > new Date() && (
            <p className="text-xs text-amber-400 mt-2">
              ⏳ Có tiền hold đến {new Date(wallet.holdUntil).toLocaleDateString("vi-VN")}
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-slate-400">Đang bị giam (Escrow)</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{formatCurrency(locked)}</p>
          <p className="text-xs text-slate-500 mt-2">Sẽ giải ngân khi hợp đồng hoàn thành</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button fullWidth variant="secondary" onClick={() => setDepositOpen(true)}>
          <ArrowDownLeft className="w-4 h-4" /> Nạp tiền
        </Button>
        <Button fullWidth variant="outline" disabled={available <= 0} onClick={() => setWithdrawOpen(true)}>
          <ArrowUpRight className="w-4 h-4" /> Rút tiền
        </Button>
      </div>

      {/* Pending Deposit Requests */}
      {depositRequests && depositRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-100 mb-3">Yêu cầu nạp tiền (Chưa chuyển khoản)</h2>
          <Card padding="none">
            <div className="divide-y divide-slate-800">
              {depositRequests.map((req) => (
                <div 
                  key={req.id} 
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => openDepositWithQr(parseFloat(req.amount), req.code)}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium">Đang chờ thanh toán</p>
                    <p className="text-slate-500 text-xs truncate">Mã: {req.code}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-amber-400">
                      {formatCurrency(parseFloat(req.amount))}
                    </p>
                    <p className="text-slate-500 text-xs">{formatDateTime(req.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Lịch sử giao dịch</h2>
        {txLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : transactions.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-slate-400">Chưa có giao dịch nào</p>
          </Card>
        ) : (
          <Card padding="none">
            <div className="divide-y divide-slate-800">
              {transactions.map((tx) => {
                const cfg = txConfig[tx.type] ?? { label: tx.type, color: "text-slate-400", icon: null };
                const isPositive = ["DEPOSIT", "ESCROW_RELEASE", "REFUND", "MILESTONE_RELEASE", "BONUS"].includes(tx.type);
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-medium">{cfg.label}</p>
                      <p className="text-slate-500 text-xs truncate">{tx.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
                        {isPositive ? "+" : "-"}{formatCurrency(parseFloat(tx.amount))}
                      </p>
                      <p className="text-slate-500 text-xs">{formatDateTime(tx.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
      
      <DepositModal open={depositOpen} onClose={handleDepositClose} initialQrData={initialQr} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} availableBalance={available} />
    </div>
  );
}

