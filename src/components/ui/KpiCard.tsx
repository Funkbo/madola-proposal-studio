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
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-500/30",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30",
    slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400 group-hover:bg-slate-800 group-hover:text-white group-hover:shadow-lg group-hover:shadow-slate-500/30",
  };

  const glowBackgrounds = {
    emerald: "from-emerald-500/5 to-transparent",
    amber: "from-amber-500/5 to-transparent",
    blue: "from-blue-500/5 to-transparent",
    slate: "from-slate-500/5 to-transparent",
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl glass-card">
      {/* Background Gradient Accent Glow */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", glowBackgrounds[accentColor])} />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <div className={cn("p-2.5 rounded-xl transition-all duration-300", accentStyles[accentColor])}>
            <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 group-hover:scale-[1.02] transition-transform duration-300 origin-left">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-0.5 rounded-full transition-transform duration-300 group-hover:scale-105 shadow-sm",
                trend.positive
                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{description}</p>}
      </CardContent>
    </Card>
  );
}
