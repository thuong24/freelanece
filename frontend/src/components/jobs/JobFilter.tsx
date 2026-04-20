"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { JobFilters } from "@/lib/types/job.types";

interface JobFilterProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
}

export const JobFilter = ({ filters, onChange }: JobFilterProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tìm kiếm công việc..."
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <Button variant="outline" size="md" onClick={() => setOpen(!open)}>
          <SlidersHorizontal className="w-4 h-4" />
          Lọc
        </Button>
      </div>

      {open && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Ngân sách tối thiểu"
            type="number"
            placeholder="100,000"
            value={filters.minBudget || ""}
            onChange={(e) => onChange({ ...filters, minBudget: Number(e.target.value) || undefined })}
          />
          <Input
            label="Ngân sách tối đa"
            type="number"
            placeholder="10,000,000"
            value={filters.maxBudget || ""}
            onChange={(e) => onChange({ ...filters, maxBudget: Number(e.target.value) || undefined })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Sắp xếp</label>
            <select
              className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.sortBy || "bumped"}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            >
              <option value="bumped">TOP trước</option>
              <option value="newest">Mới nhất</option>
              <option value="budget_desc">Ngân sách cao nhất</option>
              <option value="budget_asc">Ngân sách thấp nhất</option>
            </select>
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => onChange({ page: 1, limit: 12 })}>
              <X className="w-4 h-4" /> Xóa bộ lọc
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
