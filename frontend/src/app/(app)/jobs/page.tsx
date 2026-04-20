"use client";
import { useState } from "react";
import { useJobs } from "@/lib/hooks/useJobs";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilter } from "@/components/jobs/JobFilter";
import { Pagination } from "@/components/ui/Pagination";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Briefcase, Plus } from "lucide-react";
import Link from "next/link";
import type { JobFilters } from "@/lib/types/job.types";
import { useAuthStore } from "@/lib/stores/auth.store";

export default function JobsPage() {
  const { isAuthenticated } = useAuthStore();
  const [filters, setFilters] = useState<JobFilters>({ page: 1, limit: 12, sortBy: "bumped" });
  const { data, isLoading } = useJobs(filters);

  const jobs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Tìm việc</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {meta ? `${meta.total} công việc đang mở` : "Khám phá các dự án hấp dẫn"}
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/jobs/create">
            <Button>
              <Plus className="w-4 h-4" />
              Đăng việc
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <JobFilter filters={filters} onChange={setFilters} />

      {/* Job Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Không tìm thấy công việc"
          description="Thử thay đổi bộ lọc hoặc đăng một bài để thu hút freelancer."
          action={
            isAuthenticated
              ? <Link href="/jobs/create"><Button>Đăng việc mới</Button></Link>
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      {meta && (
        <Pagination meta={meta} onPageChange={(p) => setFilters({ ...filters, page: p })} />
      )}
    </div>
  );
}
