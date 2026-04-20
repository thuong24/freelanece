"use client";
import { Button } from "./Button";
import type { PaginationMeta } from "@/lib/types/api.types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ meta, onPageChange }: PaginationProps) => {
  const { page, totalPages } = meta;
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Trước
      </Button>
      <span className="text-sm text-slate-400 px-3">
        Trang <span className="text-slate-200 font-medium">{page}</span> / {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Sau →
      </Button>
    </div>
  );
};
