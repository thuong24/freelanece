"use client";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Clock, DollarSign, Users, Zap } from "lucide-react";
import type { Job } from "@/lib/types/job.types";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";

export const JobCard = ({ job }: { job: Job }) => (
  <Card hover className={cn("group relative flex flex-col gap-3", job.isBumped && "border-indigo-500/50 shadow-lg shadow-indigo-500/10")}>
    {job.isBumped && (
      <div className="absolute top-3 right-3 z-20">
        <span className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
          <Zap className="w-3 h-3" /> TOP
        </span>
      </div>
    )}
    
    <div className="flex-1">
      <Link href={`/jobs/${job.id}`} className="block group">
        {/* Stretched link to make whole card clickable */}
        <span className="absolute inset-0 z-10" aria-hidden="true" />
        <h3 className="text-slate-100 font-semibold group-hover:text-indigo-400 transition-colors line-clamp-2 pr-16">
          {job.title}
        </h3>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{job.description}</p>
      </Link>
    </div>

    <div className="flex flex-wrap gap-3 text-sm relative z-20 pointer-events-none">
      <span className="flex items-center gap-1.5 text-green-400 font-semibold">
        <DollarSign className="w-4 h-4" />
        {formatCurrency(parseFloat(job.budget))}
      </span>
      <span className="flex items-center gap-1.5 text-slate-400">
        <Clock className="w-4 h-4" />
        {job.deadlineDays} ngày
      </span>
      <span className="flex items-center gap-1.5 text-slate-400">
        <Users className="w-4 h-4" />
        {job.bidCount} bid
      </span>
    </div>

    <div className="flex items-center justify-between border-t border-slate-800 pt-3 relative z-20">
      <Link 
        href={`/users/${job.client?.id}`}
        className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity"
      >
        <Avatar src={job.client?.avatarUrl} name={job.client?.name} size="sm" />
        <span className="text-xs text-slate-300 font-medium truncate">{job.client?.name}</span>
      </Link>
      <span className="text-[10px] text-slate-500 whitespace-nowrap">{formatRelativeTime(job.createdAt)}</span>
    </div>
  </Card>
);
