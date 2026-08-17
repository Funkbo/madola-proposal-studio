import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  ariaLabel?: string;
}

export function Tabs({ tabs, activeTab, onChange, ariaLabel = "Settings navigation" }: TabsProps) {
  return (
    <nav className="flex space-x-1 border-b border-slate-200 dark:border-slate-800" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-t-md",
              isActive
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-2 px-2 py-0.5 text-xs rounded-full font-semibold",
                  isActive
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
