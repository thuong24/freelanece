"use client";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal = ({ open, onClose, title, children, size = "md" }: ModalProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-2rem)]", sizes[size])}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded-lg hover:bg-slate-800 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
