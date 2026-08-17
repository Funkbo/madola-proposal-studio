import React from "react";
import { cn } from "@/lib/utils";
import { ProposalStatus } from "@/types/proposal";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: ProposalStatus | "Active" | "Inactive" | "Default" | "Draft" | "Under Review" | "Approved";
  children?: React.ReactNode;
}

export function Badge({ className, status = "Default", children, ...props }: BadgeProps) {
  const getBadgeStyle = (statusVal: string) => {
    switch (statusVal) {
      case "draft":
      case "Draft":
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      case "review_required":
      case "Under Review":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
      case "approved":
      case "Approved":
      case "Active":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
      case "published":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50";
      case "accepted":
        return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold";
      case "expired":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50";
      case "Inactive":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors select-none capitalize",
        getBadgeStyle(status),
        className
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children || status.replace("_", " ")}
    </span>
  );
}
