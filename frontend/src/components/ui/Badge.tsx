import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-700 text-slate-300",
  success: "bg-green-500/15 text-green-400 border border-green-500/30",
  warning: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  danger: "bg-red-500/15 text-red-400 border border-red-500/30",
  info: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  purple: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  outline: "bg-transparent text-slate-400 border border-slate-700",
};

export const Badge = ({ variant = "default", children, className }: BadgeProps) => (
  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
    {children}
  </span>
);
