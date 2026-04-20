"use client";
import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export const Tabs = ({ tabs, active, onChange }: TabsProps) => (
  <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-800">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          active === tab.id
            ? "bg-slate-700 text-slate-100 shadow-sm"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        )}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded-full font-bold",
            active === tab.id ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-400"
          )}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
