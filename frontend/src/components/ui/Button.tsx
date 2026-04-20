"use client";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "warning" | "success";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, fullWidth, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white focus:ring-indigo-500 shadow-lg shadow-indigo-500/20",
      secondary: "bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-100 focus:ring-slate-500",
      danger: "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white focus:ring-red-500 shadow-lg shadow-red-500/20",
      ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-slate-100 focus:ring-slate-500",
      outline: "border border-slate-600 hover:border-slate-400 bg-transparent text-slate-300 hover:text-slate-100 focus:ring-slate-500",
      warning: "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 focus:ring-amber-500",
      success: "bg-green-600 hover:bg-green-500 active:bg-green-700 text-white focus:ring-green-500",
    };

    const sizes = {
      xs: "text-[10px] px-2 py-1",
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2.5",
      lg: "text-base px-6 py-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
