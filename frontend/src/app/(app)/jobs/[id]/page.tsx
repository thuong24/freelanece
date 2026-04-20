"use client";
import { useState } from "react";
import { useJob } from "@/lib/hooks/useJobs";
import { useJobBids } from "@/lib/hooks/useBids";
import { useAcceptBid } from "@/lib/hooks/useContracts";
import { useBumpJob, useDeleteJob } from "@/lib/hooks/useJobs";
import { useAuthStore } from "@/lib/stores/auth.store";
import { BidForm } from "@/components/bids/BidForm";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils/format";
import { ArrowLeft, Zap, Star, Edit, Trash2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [bidOpen, setBidOpen] = useState(false);
  const { data: job, isLoading } = useJob(id);
  const { data: bidsData } = useJobBids(id);
  const { user } = useAuthStore();
  const { mutate: acceptBid } = useAcceptBid();
  const { mutate: bumpJob } = useBumpJob(id);
  const { mutate: deleteJob } = useDeleteJob();

  if (isLoading) return <PageSpinner />;
  if (!job) return <div className="text-center text-slate-400 py-20">Không tìm thấy công việc</div>;

  const isOwner = user?.id === job.clientId;
  const bids = bidsData?.data ?? [];
  const myBid = bids.find((b) => b.bidderId === user?.id);
  const canBid = user && !isOwner && !myBid && job.status === "OPEN";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/jobs">
        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Quay lại</Button>
      </Link>

      {/* Job Detail Card */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <JobStatusBadge status={job.status} />
              {job.isBumped && <Badge variant="purple"><Zap className="w-3 h-3 inline mr-1" />TOP</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-slate-100">{job.title}</h1>
          </div>
          {isOwner && (
            <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto">
              {job.status === "OPEN" && !job.isBumped && (
                <Button variant="outline" size="sm" onClick={() => bumpJob()} className="flex-1 sm:flex-none">
                  <Zap className="w-4 h-4" /> Đẩy top
                </Button>
              )}
              <Link href={`/jobs/${id}/edit`} className="flex-1 sm:flex-none">
                <Button variant="secondary" size="sm" fullWidth><Edit className="w-4 h-4" /></Button>
              </Link>
              <Button variant="danger" size="sm" onClick={() => deleteJob(id)} className="flex-1 sm:flex-none">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Ngân sách</p>
            <p className="text-green-400 font-bold text-lg">{formatCurrency(parseFloat(job.budget))}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Deadline</p>
            <p className="text-slate-200 font-semibold">{job.deadlineDays} ngày</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Đã nhận bid</p>
            <p className="text-slate-200 font-semibold">{job.bidCount} bid</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Mô tả</h3>
          <p className="text-slate-300 whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.screeningQuestion && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">Câu hỏi sàng lọc</p>
            <p className="text-slate-300 text-sm">{job.screeningQuestion}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {job.client && (
              <>
                <Avatar name={job.client.name} src={job.client.avatarUrl} size="sm" />
                <div>
                  <p className="text-sm text-slate-300 font-medium">{job.client.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    {job.client.ratingAvg.toFixed(1)}
                  </p>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500">{formatRelativeTime(job.createdAt)}</p>
        </div>
      </Card>

      {/* Bid Section */}
      {canBid && (
        <div className="flex justify-center">
          <Button size="lg" onClick={() => setBidOpen(true)}>
            💼 Đặt giá thầu ngay
          </Button>
        </div>
      )}

      {myBid && (
        <Card className="border-indigo-500/50">
          <p className="text-sm text-indigo-400 font-semibold mb-1">✓ Bid của bạn</p>
          <p className="text-green-400 font-bold text-xl">{formatCurrency(parseFloat(myBid.bidAmount))}</p>
          <p className="text-slate-400 text-sm mt-1">{myBid.estimatedDays} ngày • {myBid.message}</p>
        </Card>
      )}

      {/* Bids List (Owner only) */}
      {isOwner && bids.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">Danh sách bid ({bids.length})</h2>
          {bids.map((bid) => (
            <Card key={bid.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                {bid.bidder && (
                  <Avatar name={bid.bidder.name} src={bid.bidder.avatarUrl} size="sm" />
                )}
                <div>
                  <p className="text-slate-200 font-medium">{bid.bidder?.name}</p>
                  <p className="text-slate-400 text-sm line-clamp-2">{bid.message}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end shrink-0 w-full sm:w-auto border-t border-slate-800 pt-3 sm:border-t-0 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-green-400 font-bold">{formatCurrency(parseFloat(bid.bidAmount))}</p>
                  <p className="text-slate-500 text-xs">{bid.estimatedDays} ngày</p>
                </div>
                {job.status === "OPEN" && bid.status === "PENDING" && (
                  <Button
                    size="sm"
                    onClick={() => acceptBid({ bidId: bid.id, amount: bid.bidAmount })}
                  >
                    <CheckCircle className="w-4 h-4" /> Chọn
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <BidForm
        jobId={id}
        screeningQuestion={job.screeningQuestion}
        open={bidOpen}
        onClose={() => setBidOpen(false)}
      />
    </div>
  );
}
