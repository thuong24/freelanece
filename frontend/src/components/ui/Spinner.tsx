import { cn } from "@/lib/utils/cn";

export const Spinner = ({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-5 h-5 border-2", lg: "w-8 h-8 border-[3px]" };
  return (
    <div
      className={cn(
        "rounded-full border-solid border-t-current border-r-current/30 border-b-current/10 border-l-transparent animate-spin",
        sizes[size],
        className
      )}
    />
  );
};

export const PageSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
    <div className="relative flex items-center justify-center w-20 h-20">
      {/* Outer track */}
      <div className="absolute inset-0 rounded-full border-4 border-slate-800/50" />
      {/* Spinning glowing ring */}
      <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      {/* Reverse spinning inner ring */}
      <div className="absolute inset-2.5 rounded-full border-[3px] border-b-purple-400 border-l-indigo-400 border-t-transparent border-r-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
      {/* Inner glowing pulse */}
      <div className="absolute inset-6 rounded-full bg-indigo-500/20 blur-md animate-pulse" />
      <div className="absolute inset-7 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] animate-pulse" />
    </div>
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-indigo-400 font-bold tracking-widest text-sm animate-pulse">ĐANG TẢI</p>
      <p className="text-slate-500 text-xs">Hệ thống đang xử lý dữ liệu...</p>
    </div>
  </div>
);
