import { cn } from "@/lib/utils/cn";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-slate-800 animate-pulse rounded-xl", className)} />
);

export const CardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);
