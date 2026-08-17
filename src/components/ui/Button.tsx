import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, type = "button", disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl select-none active:scale-[0.98]";

    const variants = {
      primary: "bg-[var(--brand-button,#10b981)] text-[var(--brand-button-text,#ffffff)] hover:brightness-110 shadow-md shadow-emerald-950/20 hover:shadow-lg hover:-translate-y-0.5",
      secondary: "bg-slate-900 dark:bg-slate-800 text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/80 shadow-sm hover:-translate-y-0.5",
      outline: "border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
      ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100",
      danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30 hover:-translate-y-0.5",
      success: "bg-[var(--brand-button,#10b981)] text-[var(--brand-button-text,#ffffff)] hover:brightness-110 shadow-md shadow-emerald-950/20 hover:shadow-lg hover:-translate-y-0.5",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
      md: "h-10 px-4 text-sm gap-2 rounded-xl",
      lg: "h-12 px-6 text-base gap-2.5 rounded-2xl font-bold",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
