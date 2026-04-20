import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
    )}
    <h3 className="text-slate-200 font-semibold text-lg">{title}</h3>
    {description && <p className="text-slate-400 text-sm mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
