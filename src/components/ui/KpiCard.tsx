import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  accentColor?: "emerald" | "amber" | "blue" | "slate";
}

export function KpiCard({ title, value, description, icon: Icon, trend, accentColor = "emerald" }: KpiCardProps) {
  const accentStyles = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <div className={cn("p-2.5 rounded-lg", accentStyles[accentColor])}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
          {trend && (
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                trend.positive
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{description}</p>}
      </CardContent>
    </Card>
  );
}
