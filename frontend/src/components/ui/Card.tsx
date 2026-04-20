import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

export const Card = ({ children, className, hover, padding = "md" }: CardProps) => {
  const pads = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <div className={cn(
      "bg-slate-900 border border-slate-800 rounded-2xl",
      pads[padding],
      hover && "hover:border-slate-700 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("mb-4", className)}>{children}</div>
);

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn("text-lg font-semibold text-slate-100", className)}>{children}</h3>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("text-slate-400 text-sm", className)}>{children}</div>
);
