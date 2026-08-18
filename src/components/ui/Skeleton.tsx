"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "table-row";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = "text", width, height, ...props }: SkeletonProps) {
  const baseStyles = "animate-pulse bg-slate-200 dark:bg-slate-800 rounded";

  const variantStyles = {
    text: "h-4 rounded-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl",
    "table-row": "h-16 rounded-none",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }: { lines?: number; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? "60%" : "100%"} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4 p-6", className)} {...props}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={60} />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ columns = 5, className, ...props }: { columns?: number; className?: string } & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn(className)} {...props}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" width={i === 0 ? "80%" : "60%"} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, columns = 5, className, ...props }: { rows?: number; columns?: number; className?: string } & React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800", className)} {...props}>
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/50">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton variant="text" width="70%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <SkeletonTableRow key={rowIndex} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonKpiGrid({ count = 4, className, ...props }: { count?: number; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="circular" width={40} height={40} className="p-2.5" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <Skeleton variant="text" width="50%" className="h-10" />
            <Skeleton variant="text" width="30%" className="h-6" />
          </div>
          <Skeleton variant="text" width="60%" className="mt-2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProposalList({ rows = 5, className, ...props }: { rows?: number; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 animate-pulse">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="50%" />
          </div>
          <Skeleton variant="text" width="80px" height="24px" className="rounded-full" />
          <Skeleton variant="text" width="90px" height="32px" className="rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCustomerForm({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4 max-w-xl", className)} {...props}>
      <Skeleton variant="text" width="40%" className="h-6" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton variant="text" className="h-10" />
        <Skeleton variant="text" className="h-10" />
      </div>
      <Skeleton variant="text" className="h-10" />
      <Skeleton variant="text" className="h-10" />
      <Skeleton variant="text" className="h-10" />
      <div className="flex gap-3 pt-4">
        <Skeleton variant="text" width="120px" height="40px" className="rounded-xl" />
        <Skeleton variant="text" width="120px" height="40px" className="rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonDashboard({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-8", className)} {...props}>
      <div className="space-y-2">
        <Skeleton variant="text" width="40%" className="h-8" />
        <Skeleton variant="text" width="60%" className="h-5" />
      </div>
      <SkeletonKpiGrid count={4} />
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" className="h-6" />
        <SkeletonProposalList rows={5} />
      </div>
    </div>
  );
}